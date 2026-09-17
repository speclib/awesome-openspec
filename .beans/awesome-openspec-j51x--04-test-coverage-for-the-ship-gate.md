---
# awesome-openspec-j51x
title: 04 Test coverage for the ship gate
status: todo
type: milestone
priority: normal
created_at: 2026-09-17T16:32:32Z
updated_at: 2026-09-17T16:32:47Z
---

There is no test suite yet, so the coverage gate in flake.nix fails by design.
This milestone is the work that makes the first /mip:ship possible: tests for the
custom lint rules and the enrichment scripts, up to 70% overall and 80% on the
core packages (rules/ and scripts/).

Nothing ships through scripts/ship-change.sh until this milestone is done.
