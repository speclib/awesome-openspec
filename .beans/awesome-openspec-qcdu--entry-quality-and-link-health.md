---
# awesome-openspec-qcdu
title: Entry quality and link health
status: completed
type: epic
priority: normal
created_at: 2026-09-17T16:33:03Z
updated_at: 2026-09-18T16:04:27Z
parent: awesome-openspec-0u7g
openspec-link: openspec/changes/archive/2026-09-18-split-uis-web-and-terminal
---

Keep existing entries honest: links that still resolve, descriptions that still
describe the project, language markers on non-English resources, and removal of
resources that have been abandoned or absorbed elsewhere.

## Summary of Changes

Split the UIs section into `### Web & Desktop` and `### Terminal` subsections
and added specgetty to the Terminal one, following the contribution guidelines
(139-character line, alphabetical within its subsection).

Extended CONTRIBUTING.md so contributors know to place an entry in the matching
subsection. Amended the alphabetical-ordering spec, which previously required a
whole section to read alphabetically: that is no longer true across a subsection
boundary, where "dossier" follows "Spek".

The website still shows one UIs group, because the parser tracks only `##`
headings. That is now recorded as intended behavior in the readme-parsing spec.

Shipped in openspec/changes/archive/2026-09-18-split-uis-web-and-terminal.
