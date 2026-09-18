---
# awesome-openspec-lled
title: Tests for rules/
status: completed
type: epic
priority: normal
created_at: 2026-09-17T16:33:03Z
updated_at: 2026-09-18T16:04:00Z
parent: awesome-openspec-j51x
openspec-link: openspec/changes/archive/2026-09-18-testable-scripts-and-test-suite
---

node:test coverage for alphabetical-order.js and list-item-length.js: ordered and
unordered sections, boundary line lengths, and the shape of the reported errors.
Target 80% as a core package.

## Summary of Changes

Added `test/rules/alphabetical-order.test.js` (8 tests) and
`test/rules/list-item-length.test.js` (6 tests), plus a shared `lint()` helper
that runs a rule through remark and returns its messages.

Coverage for `rules/` is 100%. The length tests assert the 150-character
boundary exactly, at 150 and at 151, and the ordering tests cover the
independent-per-list behavior that the UIs subsections depend on.

Shipped in openspec/changes/archive/2026-09-18-testable-scripts-and-test-suite.
