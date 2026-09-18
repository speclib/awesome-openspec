import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseReadme, fetchRepoData, main } from '../../scripts/fetch-github-stats.js';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'sample-readme.md');
const parse = () => parseReadme({ readmePath: FIXTURE });

function response(body, { status = 200, headers = {} } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k) => headers[k.toLowerCase()] ?? null },
    json: async () => body,
  };
}

const FULL_REPO = {
  stargazers_count: 99,
  pushed_at: '2026-02-02T00:00:00Z',
  description: 'A repo.',
  language: 'Go',
  license: { spdx_id: 'MIT' },
  topics: ['openspec'],
  archived: false,
  open_issues_count: 3,
};

test('parseReadme finds every GitHub repo with its section', () => {
  const repos = parse();
  const names = repos.map((r) => r.name);
  assert.ok(names.includes('specgetty'));
  assert.equal(repos.find((r) => r.name === 'specgetty').section, 'UIs');
  assert.equal(repos.find((r) => r.name === 'dossier').section, 'UIs');
});

test('deep links resolve to the repository root', () => {
  const entry = parse().find((r) => r.name === 'Getting Started');
  assert.equal(entry.owner, 'Fission-AI');
  assert.equal(entry.repo, 'OpenSpec');
  assert.equal(entry.url, 'https://github.com/Fission-AI/OpenSpec');
});

test('non-GitHub links are skipped', () => {
  const names = parse().map((r) => r.name);
  assert.equal(names.includes('Discord'), false);
  assert.equal(names.includes('A Blog Post'), false);
  assert.equal(names.includes('A Talk'), false);
});

test('anchor links in the table of contents are skipped', () => {
  assert.equal(parse().some((r) => r.name === 'Videos'), false);
});

test('repos are deduplicated case-insensitively, keeping the first', () => {
  const repos = parse();
  const keys = repos.map((r) => `${r.owner}/${r.repo}`.toLowerCase());
  assert.equal(new Set(keys).size, keys.length);
});

test('fetchRepoData maps the API payload onto the record shape', async () => {
  const data = await fetchRepoData('o', 'r', {}, async () => response(FULL_REPO));
  assert.equal(data.stars, 99);
  assert.equal(data.license, 'MIT');
  assert.deepEqual(data.topics, ['openspec']);
  assert.equal(data.open_issues_count, 3);
});

test('a missing license and topics fall back to null and an empty list', async () => {
  const data = await fetchRepoData('o', 'r', {}, async () => response({
    ...FULL_REPO, license: null, topics: undefined,
  }));
  assert.equal(data.license, null);
  assert.deepEqual(data.topics, []);
});

test('a 404 returns a not_found error rather than throwing', async () => {
  const data = await fetchRepoData('o', 'r', {}, async () => response({}, { status: 404 }));
  assert.deepEqual(data, { error: 'not_found' });
});

test('another failing status returns its http_ code', async () => {
  const data = await fetchRepoData('o', 'r', {}, async () => response({}, { status: 500 }));
  assert.deepEqual(data, { error: 'http_500' });
});

test('a 403 throws a rate-limit error carrying the reset time', async () => {
  await assert.rejects(
    () => fetchRepoData('o', 'r', {}, async () => response({}, {
      status: 403, headers: { 'x-ratelimit-reset': '1700000000' },
    })),
    (err) => {
      assert.equal(err.rateLimited, true);
      assert.match(err.message, /Rate limited\. Resets at 2023-11-14/);
      return true;
    }
  );
});

test('a 403 without the reset header reports an unknown reset', async () => {
  await assert.rejects(
    () => fetchRepoData('o', 'r', {}, async () => response({}, { status: 403 })),
    /Resets at unknown/
  );
});

test('main writes repos.json, recording failures without aborting', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'awesome-openspec-stats-'));
  const outputPath = join(dir, 'repos.json');

  const result = await main({
    readmePath: FIXTURE,
    outputDir: dir,
    outputPath,
    fetchImpl: async (url) => (
      url.includes('/spekhq/spek')
        ? response({}, { status: 404 })
        : response(FULL_REPO)
    ),
  });

  const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
  assert.ok(written.generated_at);
  assert.equal(written.repos.length, result.repos.length);
  assert.equal(result.failed, 1);

  const failedEntry = written.repos.find((r) => r.repo === 'spek');
  assert.equal(failedEntry.error, 'not_found');
  assert.equal(failedEntry.stars, null);

  const okEntry = written.repos.find((r) => r.repo === 'specgetty');
  assert.equal(okEntry.stars, 99);
});

test('main stops early on rate limiting and still writes what it has', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'awesome-openspec-stats-'));
  const outputPath = join(dir, 'repos.json');
  let calls = 0;

  await main({
    readmePath: FIXTURE,
    outputDir: dir,
    outputPath,
    fetchImpl: async () => {
      calls++;
      return response({}, { status: 403, headers: { 'x-ratelimit-reset': '1700000000' } });
    },
  });

  assert.equal(calls, 1);
  const written = JSON.parse(readFileSync(outputPath, 'utf-8'));
  assert.deepEqual(written.repos, []);
});
