---
# awesome-openspec-j51x
title: 04 Test coverage for the ship gate
status: completed
type: milestone
priority: normal
created_at: 2026-09-17T16:32:32Z
updated_at: 2026-09-18T16:04:00Z
openspec-link: openspec/changes/archive/2026-09-18-testable-scripts-and-test-suite
---

There is no test suite yet, so the coverage gate in flake.nix fails by design.
This milestone is the work that makes the first /mip:ship possible: tests for the
custom lint rules and the enrichment scripts, up to 70% overall and 80% on the
core packages (rules/ and scripts/).

Nothing ships through scripts/ship-change.sh until this milestone is done.

## Summary of Changes

The ship gate is green for the first time: 93.5% overall, 100% on `rules/`,
92.2% on `scripts/`, against thresholds of 70% and 80%.

Both epics are complete. `remark` was promoted from a hoisted transitive
dependency to a declared devDependency, and the flake npmDepsHash was updated
to match.
