# Make the scripts testable and cover them

## Why

`nix flake check` runs a coverage gate of 70% overall and 80% on the core
packages (`rules/` and `scripts/`). Nothing can currently satisfy it, because
every file in `scripts/` runs its work at import time:

- `fetch-entries.js` and `fetch-github-stats.js` call `main()` on the last line,
  and `main()` reaches the network.
- `coverage-gate.mjs` reads `process.argv` and calls `process.exit()` at module
  scope.

A test cannot import any of them without triggering that work, so the gate sits
at 0% and blocks every ship. This change removes that structural blocker and
covers the code behind it.

The two files under `rules/` are already clean ES modules and need no change,
only tests.

## What Changes

- Split each script into an importable module part and a CLI part, so importing
  it has no side effects and running it from the command line behaves exactly as
  it does today.
- Parameterise the hardcoded input and output paths so a test can point them at
  a fixture instead of the real `README.md` and `data/`.
- Add a `test/` suite using `node:test` covering the lint rules, the README
  parsing, the entry classification, the language-marker handling, and the
  coverage gate's own threshold logic.
- Route network access in the two fetch scripts through an injectable fetch, so
  enrichment paths are tested against stubs rather than the live GitHub API.

## Impact

- Affected specs: `script-entrypoints` (new), `ship-gate` (new),
  `entry-extraction` (clarified), `github-enrichment` (clarified)
- Affected code: `scripts/fetch-entries.js`, `scripts/fetch-github-stats.js`,
  `scripts/coverage-gate.mjs`, new `test/`
- No behavior change for anyone running the scripts or the site build. The
  CLI contract, the output format, and `data/entries.json` stay identical.
- Beans: milestone `awesome-openspec-j51x`, epics `awesome-openspec-lled` and
  `awesome-openspec-ispx`.
