import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  classify, parseReadme, enrichRepos, enrichVideos, main,
} from '../../scripts/fetch-entries.js';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'sample-readme.md');
const parse = () => parseReadme({ readmePath: FIXTURE });

/** A fetch stub that answers from a map of url-substring to response. */
function stubFetch(handler) {
  const calls = [];
  const impl = async (url, options) => {
    calls.push(url);
    return handler(url, options);
  };
  impl.calls = calls;
  return impl;
}

function jsonResponse(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    json: async () => body,
  };
}

test('classify recognises repo, video and link URLs', () => {
  assert.deepEqual(classify('https://github.com/owner/repo'), {
    type: 'repo', owner: 'owner', repo: 'repo',
  });
  assert.deepEqual(classify('https://github.com/owner/repo/'), {
    type: 'repo', owner: 'owner', repo: 'repo',
  });
  assert.deepEqual(classify('https://youtu.be/abc123XYZ_-'), {
    type: 'video', video_id: 'abc123XYZ_-',
  });
  assert.deepEqual(classify('https://www.youtube.com/watch?v=def456UVW'), {
    type: 'video', video_id: 'def456UVW',
  });
  assert.deepEqual(classify('https://github.com/o/r/blob/main/docs/x.md'), { type: 'link' });
  assert.deepEqual(classify('https://dev.to/someone/a-post'), { type: 'link' });
});

test('parseReadme groups entries under their ## section', () => {
  const sections = parse();
  const titles = sections.map((s) => s.title);
  assert.deepEqual(titles, ['UIs', 'Videos', 'Articles & Tutorials', 'Community']);
});

test('### subsection headings do not create sections', () => {
  const uis = parse().find((s) => s.title === 'UIs');
  assert.equal(uis.entries.length, 4);
  assert.deepEqual(
    uis.entries.map((e) => e.name),
    ['Specboard', 'Spek', 'dossier', 'specgetty']
  );
});

test('sections with no entries are dropped', () => {
  assert.equal(parse().some((s) => s.title === 'Empty Section'), false);
});

test('the table-of-contents anchor list is not treated as entries', () => {
  assert.equal(parse().some((s) => s.title === 'Contents'), false);
});

test('language markers are tagged and stripped', () => {
  const videos = parse().find((s) => s.title === 'Videos').entries;
  const zh = videos.find((e) => e.name === 'Another Talk');
  const en = videos.find((e) => e.name === 'A Talk');
  assert.equal(zh.language_tag, 'zh');
  assert.equal(zh.description, 'Another talk.');
  assert.equal(en.language_tag, 'en');
});

test('entry types are assigned across sections', () => {
  const all = parse().flatMap((s) => s.entries);
  const byName = Object.fromEntries(all.map((e) => [e.name, e.type]));
  assert.equal(byName['specgetty'], 'repo');
  assert.equal(byName['A Talk'], 'video');
  assert.equal(byName['Getting Started'], 'link');
  assert.equal(byName['Discord'], 'link');
});

test('enrichRepos attaches stars and continues past one failure', async () => {
  const sections = parse();
  const fetchImpl = stubFetch(async (url) => {
    if (url.includes('/spekhq/spek')) return jsonResponse({}, { status: 404 });
    return jsonResponse({
      stargazers_count: 42, pushed_at: '2026-01-01T00:00:00Z',
      language: 'Go', archived: false,
    });
  });

  const { total, failed } = await enrichRepos(sections, { fetchImpl });
  assert.equal(total, 4);
  assert.equal(failed, 1);

  const uis = sections.find((s) => s.title === 'UIs').entries;
  assert.equal(uis.find((e) => e.name === 'specgetty').stars, 42);
  assert.equal(uis.find((e) => e.name === 'Spek').stars, undefined);
});

test('enrichRepos stops early when the API reports rate limiting', async () => {
  const sections = parse();
  const fetchImpl = stubFetch(async () => jsonResponse({}, {
    status: 403, headers: { 'x-ratelimit-reset': '1700000000' },
  }));
  const { total } = await enrichRepos(sections, { fetchImpl });
  assert.equal(total, 4);
  assert.equal(fetchImpl.calls.length, 1, 'should stop after the first rate-limit response');
});

test('enrichVideos does nothing without an API key', async () => {
  const sections = parse();
  const previous = process.env.YOUTUBE_API_KEY;
  delete process.env.YOUTUBE_API_KEY;
  const fetchImpl = stubFetch(async () => { throw new Error('should not be called'); });
  await enrichVideos(sections, { fetchImpl });
  assert.equal(fetchImpl.calls.length, 0);
  if (previous !== undefined) process.env.YOUTUBE_API_KEY = previous;
});

test('enrichVideos attaches view counts when a key is set', async () => {
  const sections = parse();
  const previous = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = 'test-key';
  const fetchImpl = stubFetch(async () => jsonResponse({
    items: [{ id: 'abc123XYZ_-', statistics: { viewCount: '1234' } }],
  }));
  await enrichVideos(sections, { fetchImpl });
  const videos = sections.find((s) => s.title === 'Videos').entries;
  assert.equal(videos.find((e) => e.name === 'A Talk').views, 1234);
  assert.equal(videos.find((e) => e.name === 'Another Talk').views, undefined);
  if (previous === undefined) delete process.env.YOUTUBE_API_KEY;
  else process.env.YOUTUBE_API_KEY = previous;
});

test('enrichVideos survives an API error', async () => {
  const sections = parse();
  const previous = process.env.YOUTUBE_API_KEY;
  process.env.YOUTUBE_API_KEY = 'test-key';
  await enrichVideos(sections, { fetchImpl: stubFetch(async () => jsonResponse({}, { status: 500 })) });
  await enrichVideos(sections, { fetchImpl: stubFetch(async () => { throw new Error('offline'); }) });
  const videos = sections.find((s) => s.title === 'Videos').entries;
  assert.equal(videos.every((v) => v.views === undefined), true);
  if (previous === undefined) delete process.env.YOUTUBE_API_KEY;
  else process.env.YOUTUBE_API_KEY = previous;
});

test('main writes a dataset to the given output path', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'awesome-openspec-test-'));
  const outputPath = join(dir, 'entries.json');
  const fetchImpl = stubFetch(async () => jsonResponse({
    stargazers_count: 7, pushed_at: '2026-01-01T00:00:00Z', language: 'JS', archived: false,
  }));

  const result = await main({
    readmePath: FIXTURE, outputDir: dir, outputPath, fetchImpl,
  });

  assert.equal(existsSync(outputPath), true);
  const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
  assert.ok(written.generated_at, 'dataset carries a generated_at timestamp');
  assert.deepEqual(written.sections.map((s) => s.title), ['UIs', 'Videos', 'Articles & Tutorials', 'Community']);
  assert.equal(result.total, 4);
  assert.equal(result.failed, 0);
});
