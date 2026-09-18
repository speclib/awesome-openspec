# Tasks

Beans: milestone awesome-openspec-j51x, epics awesome-openspec-lled (rules) and
awesome-openspec-ispx (scripts).

## 1. Make the scripts importable

- [x] 1.1 In `scripts/fetch-entries.js`, export `classify`, `parseReadme`, `enrichRepos`, `enrichVideos` and `main`; give `parseReadme` an options object defaulting to the current README path, and `main` options for the output path and fetch client.
- [x] 1.2 In `scripts/fetch-github-stats.js`, export `parseReadme`, `fetchRepoData` and `main`, and route every network call through an injectable `fetchImpl` defaulting to `globalThis.fetch`.
- [x] 1.3 In `scripts/coverage-gate.mjs`, export `parseLcov`, `isTest`, `percentage` and `evaluate`, and move the argv reading and `process.exit` into the main-module guard.
- [x] 1.4 Guard the CLI entry of all three with `import.meta.filename === process.argv[1]` so importing them does nothing.

## 2. Tests

- [x] 2.1 `test/rules/alphabetical-order.test.js`: ordered lists pass; an out-of-order entry reports; the TOC list (all-anchor links) is skipped; a list with fewer than two links is skipped; case-insensitive comparison.
- [x] 2.2 `test/rules/list-item-length.test.js`: an entry at exactly 150 characters passes; 151 reports; non-entry list items are ignored.
- [x] 2.3 `test/scripts/fetch-entries.test.js`: classification of repo, video and link; language marker stripped and tagged; `###` subsection headings inherit the parent `##` section; sections with no entries dropped; enrichment against a stubbed client including one failing repo.
- [x] 2.4 `test/scripts/fetch-github-stats.test.js`: README parsing against a fixture, deep links resolved to repo root, non-GitHub links skipped, and the API error path against a stub.
- [x] 2.5 `test/scripts/coverage-gate.test.js`: lcov parsing; test records excluded; overall below threshold fails; a core package below 80 fails while overall passes; all-pass returns success; an empty report fails.
- [x] 2.6 Add fixtures under `test/fixtures/` for the README shapes the tests parse.

## 3. Verification

- [x] 3.1 Run `node --test --experimental-test-coverage` locally and confirm every test passes.
- [x] 3.2 Confirm the CLI contract is intact: `node scripts/fetch-entries.js` regenerates `data/entries.json` with the same section and entry counts as before, and `node scripts/fetch-github-stats.js` runs.
- [x] 3.3 Run `npm --prefix site run build` against the regenerated data and confirm the site still builds.
- [x] 3.4 Run `nix flake check` and confirm the coverage gate passes at >=70% overall and >=80% for `rules/` and `scripts/`.
