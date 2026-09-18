# Design

## Context

Three CLI scripts must become importable without changing how they behave when
run. The repository has no test suite and no test dependencies; the ship gate
uses Node's built-in runner, so the design must not add npm packages.

## Goals

- Importing any file under `scripts/` performs no I/O, no network calls and no
  `process.exit()`.
- `node scripts/<name>.js` keeps its current behavior, output and exit codes.
- No new runtime or dev dependencies.

## Decisions

### Decision: guard the CLI entry with an explicit main-module check

Each script keeps its `main()` but only calls it when the file is the process
entry point:

```js
if (process.argv[1] && import.meta.filename === process.argv[1]) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
```

**Why:** `import.meta.filename` is available in Node 22 (the version the flake
pins) and compares directly against `process.argv[1]`. It needs no helper and no
dependency.

**Alternative rejected:** splitting each script into a `lib/` module plus a thin
`bin/` wrapper. Cleaner in principle, but it doubles the file count and changes
the paths the GitHub workflows invoke, which is churn this change does not need.

### Decision: pass paths and fetch as options with today's values as defaults

`parseReadme({readmePath})`, `writeEntries({outputPath})` and the enrichment
functions take an options object whose defaults are the current constants, and
the fetch scripts accept `{fetchImpl = globalThis.fetch}`.

**Why:** call sites in `main()` stay argument-free, so the CLI path is unchanged
and the diff stays small, while tests can redirect every side effect.

**Alternative rejected:** environment variables for the paths. That would add a
new public interface to the scripts and could surprise the workflows.

### Decision: stub the network, never call GitHub in tests

Enrichment tests pass a `fetchImpl` returning canned responses, including the
error and rate-limit branches.

**Why:** the gate runs inside a nix build with no network, so any test touching
the real API would fail there. Stubs also make the failure branches reachable,
which is what lifts `scripts/` over 80%.

## Risks

- **Risk:** the main-module guard misfires and the CLI silently stops working.
  **Mitigation:** the tasks include running all three scripts from the command
  line and confirming the site still builds from the regenerated data.
- **Risk:** coverage sits just under a threshold and blocks the ship.
  **Mitigation:** the gate prints a per-scope table, so the uncovered scope is
  named; add cases for its untested branches.
