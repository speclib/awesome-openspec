---
# awesome-openspec-ispx
title: Tests for scripts/
status: completed
type: epic
priority: normal
created_at: 2026-09-17T16:33:03Z
updated_at: 2026-09-18T16:04:00Z
parent: awesome-openspec-j51x
openspec-link: openspec/changes/archive/2026-09-18-testable-scripts-and-test-suite
---

node:test coverage for fetch-entries.js and fetch-github-stats.js: README
parsing against fixtures, and the network paths exercised against stubs rather
than the live GitHub API. Target 80% as a core package.

## Summary of Changes

Made every module under `scripts/` importable without side effects by guarding
the CLI entry with `import.meta.filename === process.argv[1]`, exporting the
functions, and accepting the input path, output path and fetch client as
options that default to the existing values.

Added `test/scripts/fetch-entries.test.js` (13 tests),
`test/scripts/fetch-github-stats.test.js` (13 tests) and
`test/scripts/coverage-gate.test.js` (12 tests), all against fixtures and
stubbed network clients, covering the rate-limit and failure branches.

Coverage for `scripts/` is 92.2%. The CLI contract is unchanged: rerunning
`node scripts/fetch-entries.js` produced an entries.json identical to the
pre-refactor output apart from its timestamp.

Shipped in openspec/changes/archive/2026-09-18-testable-scripts-and-test-suite.
