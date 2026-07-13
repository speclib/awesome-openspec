#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const README_PATH = join(ROOT, 'README.md');
const OUTPUT_DIR = join(ROOT, 'data');
const OUTPUT_PATH = join(OUTPUT_DIR, 'entries.json');

const SECTION_RE = /^## (.+)$/;
const ENTRY_RE = /^- \[([^\]]+)\]\((https?:[^)\s]+)\)(?: - (.*))?$/;
const GITHUB_REPO_RE = /^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)\/?$/;
const YOUTUBE_RE = /^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
const LANGUAGE_MARKER_RE = /\s*\((?:Chinese|Taiwanese)[^)]*\)\s*$/;

function classify(url) {
  const repoMatch = url.match(GITHUB_REPO_RE);
  if (repoMatch) {
    return { type: 'repo', owner: repoMatch[1], repo: repoMatch[2] };
  }
  const videoMatch = url.match(YOUTUBE_RE);
  if (videoMatch) {
    return { type: 'video', video_id: videoMatch[1] };
  }
  return { type: 'link' };
}

function parseReadme() {
  const content = readFileSync(README_PATH, 'utf-8');
  const lines = content.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      current = { title: sectionMatch[1].trim(), entries: [] };
      sections.push(current);
      continue;
    }

    if (!current) continue;
    if (!line.startsWith('- [')) continue;

    const entryMatch = line.match(ENTRY_RE);
    if (!entryMatch) {
      // Anchor links (the TOC) are expected non-entries; anything else is malformed.
      if (!/^- \[[^\]]+\]\(#/.test(line)) {
        console.warn(`⚠ Skipping unparseable entry line: ${line}`);
      }
      continue;
    }

    const [, name, url, rawDescription = ''] = entryMatch;
    const language_tag = LANGUAGE_MARKER_RE.test(rawDescription) ? 'zh' : 'en';
    const description = rawDescription.replace(LANGUAGE_MARKER_RE, '').trim();

    current.entries.push({
      name,
      url,
      description,
      language_tag,
      ...classify(url),
    });
  }

  return sections.filter((s) => s.entries.length > 0);
}

async function fetchRepoData(owner, repo, headers) {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });

  if (res.status === 403) {
    const resetHeader = res.headers.get('x-ratelimit-reset');
    const resetTime = resetHeader
      ? new Date(Number(resetHeader) * 1000).toISOString()
      : 'unknown';
    throw Object.assign(new Error(`Rate limited. Resets at ${resetTime}`), {
      rateLimited: true,
    });
  }

  if (!res.ok) {
    return { error: `http_${res.status}` };
  }

  const data = await res.json();
  return {
    stars: data.stargazers_count,
    pushed_at: data.pushed_at,
    language: data.language,
    archived: data.archived,
  };
}

async function enrichRepos(sections) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠ GITHUB_TOKEN not set — using unauthenticated requests (60 req/hr limit)');
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'awesome-openspec-site',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const repos = sections.flatMap((s) => s.entries.filter((e) => e.type === 'repo'));
  let failed = 0;

  for (let i = 0; i < repos.length; i++) {
    const entry = repos[i];
    console.log(`[${i + 1}/${repos.length}] Fetching ${entry.owner}/${entry.repo}...`);
    try {
      const data = await fetchRepoData(entry.owner, entry.repo, headers);
      if (data.error) {
        failed++;
        console.warn(`⚠ ${entry.owner}/${entry.repo}: ${data.error}`);
      } else {
        Object.assign(entry, data);
      }
    } catch (err) {
      if (err.rateLimited) {
        console.error(`✖ ${err.message} — continuing with data fetched so far.`);
        break;
      }
      failed++;
      console.warn(`⚠ ${entry.owner}/${entry.repo}: ${err.message}`);
    }
  }

  return { total: repos.length, failed };
}

async function enrichVideos(sections) {
  const videos = sections.flatMap((s) => s.entries.filter((e) => e.type === 'video'));
  if (videos.length === 0) return;

  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    console.log('ℹ YOUTUBE_API_KEY not set — skipping video view counts');
    return;
  }

  try {
    const ids = videos.map((v) => v.video_id).join(',');
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${ids}&key=${key}`
    );
    if (!res.ok) {
      console.warn(`⚠ YouTube API returned ${res.status} — skipping view counts`);
      return;
    }
    const data = await res.json();
    const viewsById = new Map(
      (data.items ?? []).map((item) => [item.id, Number(item.statistics?.viewCount)])
    );
    for (const video of videos) {
      const views = viewsById.get(video.video_id);
      if (Number.isFinite(views)) {
        video.views = views;
      }
    }
    console.log(`✓ Fetched view counts for ${viewsById.size}/${videos.length} videos`);
  } catch (err) {
    console.warn(`⚠ YouTube enrichment failed (${err.message}) — skipping view counts`);
  }
}

async function main() {
  const sections = parseReadme();
  const counts = sections.flatMap((s) => s.entries).reduce(
    (acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }),
    {}
  );
  console.log(
    `Found ${sections.length} sections: ${counts.repo ?? 0} repos, ` +
      `${counts.video ?? 0} videos, ${counts.link ?? 0} links\n`
  );

  const { total, failed } = await enrichRepos(sections);
  await enrichVideos(sections);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const output = {
    generated_at: new Date().toISOString(),
    sections,
  };
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n');

  console.log(`\n✓ Done: ${total - failed}/${total} repos enriched`);
  console.log(`  Output: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
