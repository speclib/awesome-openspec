#!/usr/bin/env node

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const README_PATH = join(ROOT, 'README.md');
const OUTPUT_DIR = join(ROOT, 'data');
const OUTPUT_PATH = join(OUTPUT_DIR, 'repos.json');

const GITHUB_REPO_RE = /\[([^\]]+)\]\(https?:\/\/github\.com\/([^/]+)\/([^/)#\s]+)(?:\/[^)]*?)?\)/g;
const SECTION_RE = /^## (.+)$/;

export function parseReadme({ readmePath = README_PATH } = {}) {
  const content = readFileSync(readmePath, 'utf-8');
  const lines = content.split('\n');
  const seen = new Set();
  const repos = [];
  let currentSection = null;

  for (const line of lines) {
    const sectionMatch = line.match(SECTION_RE);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    if (!currentSection) continue;

    let match;
    GITHUB_REPO_RE.lastIndex = 0;
    while ((match = GITHUB_REPO_RE.exec(line)) !== null) {
      const [, name, owner, repo] = match;
      const key = `${owner}/${repo}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      repos.push({
        name,
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
        section: currentSection,
      });
    }
  }

  return repos;
}

export async function fetchRepoData(owner, repo, headers, fetchImpl = globalThis.fetch) {
  const url = `https://api.github.com/repos/${owner}/${repo}`;
  const res = await fetchImpl(url, { headers });

  if (res.status === 403) {
    const resetHeader = res.headers.get('x-ratelimit-reset');
    const resetTime = resetHeader
      ? new Date(Number(resetHeader) * 1000).toISOString()
      : 'unknown';
    throw Object.assign(new Error(`Rate limited. Resets at ${resetTime}`), {
      rateLimited: true,
    });
  }

  if (res.status === 404) {
    return { error: 'not_found' };
  }

  if (!res.ok) {
    return { error: `http_${res.status}` };
  }

  const data = await res.json();
  return {
    stars: data.stargazers_count,
    pushed_at: data.pushed_at,
    description: data.description,
    language: data.language,
    license: data.license?.spdx_id ?? null,
    topics: data.topics ?? [],
    archived: data.archived,
    open_issues_count: data.open_issues_count,
  };
}

export async function main({
  readmePath = README_PATH,
  outputDir = OUTPUT_DIR,
  outputPath = OUTPUT_PATH,
  fetchImpl = globalThis.fetch,
} = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn('⚠ GITHUB_TOKEN not set — using unauthenticated requests (60 req/hr limit)');
  }

  const headers = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'awesome-openspec-stats',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const repos = parseReadme({ readmePath });
  console.log(`Found ${repos.length} GitHub repos in README.md\n`);

  const results = [];
  let failed = 0;

  for (let i = 0; i < repos.length; i++) {
    const entry = repos[i];
    console.log(`[${i + 1}/${repos.length}] Fetching ${entry.owner}/${entry.repo}...`);

    try {
      const data = await fetchRepoData(entry.owner, entry.repo, headers, fetchImpl);
      if (data.error) {
        failed++;
        results.push({
          ...entry,
          stars: null,
          pushed_at: null,
          description: null,
          language: null,
          license: null,
          topics: null,
          archived: null,
          open_issues_count: null,
          error: data.error,
        });
      } else {
        results.push({ ...entry, ...data });
      }
    } catch (err) {
      if (err.rateLimited) {
        console.error(`\n✖ ${err.message}`);
        console.error('Stopping — writing already-fetched data.');
        break;
      }
      failed++;
      results.push({
        ...entry,
        stars: null,
        pushed_at: null,
        description: null,
        language: null,
        license: null,
        topics: null,
        archived: null,
        open_issues_count: null,
        error: err.message,
      });
    }
  }

  mkdirSync(outputDir, { recursive: true });

  const output = {
    generated_at: new Date().toISOString(),
    repos: results,
  };

  writeFileSync(outputPath, JSON.stringify(output, null, 2) + '\n');

  const successful = results.length - failed;
  console.log(`\n✓ Done: ${successful} successful, ${failed} failed out of ${repos.length} repos`);
  console.log(`  Output: ${outputPath}`);

  return { repos: results, failed };
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
