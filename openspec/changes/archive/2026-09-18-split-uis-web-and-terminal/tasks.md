# Split the UIs section into Web & Desktop and Terminal

Schema: `tinychange`, from https://github.com/speclib/openspec-tinychange-schema
(install it with the guide in that repo's AGENT_INSTALL.md).

Bean: awesome-openspec-qcdu (Entry quality and link health), under milestone
awesome-openspec-0u7g.

## 1. Implementation

- [x] 1.1 In `README.md`, split `## UIs` into two subsections: `### Web & Desktop` holding openspec-ui, openspec-viewer, openspec-webui, OpenSpecUI, Specboard, speclens and Spek; and `### Terminal` holding dossier.
- [x] 1.2 Add `- [specgetty](https://github.com/speclib/specgetty) - Terminal UI for finding OpenSpec projects on your machine and reporting their status.` to `### Terminal`, after dossier (139 characters, within the 150 limit).
- [x] 1.3 Leave the `## Contents` list untouched. The TOC lists `## ` sections only, and awesome-lint's toc rule does not ask for subsections.
- [x] 1.4 In `CONTRIBUTING.md`, extend the ordering guideline to say that where a section has subsections, the entry goes in the matching subsection and is ordered within it.

## 2. Verification

- [x] 2.1 Run `npm run lint` and confirm it reports no NEW warnings against the baseline of 4 pre-existing ones (TOC "Related Projects" mismatch, two over-length list items, one ordering violation in Related Awesome Lists). Note that remark exits 0 on warnings, so read the output rather than trusting the exit code.
- [x] 2.2 Run `node scripts/fetch-entries.js` and confirm `data/entries.json` has 9 entries under section `"UIs"`, specgetty among them, and that no "Skipping unparseable entry line" warning was printed for the `###` headings.
- [x] 2.3 Run `npm --prefix site run build` and confirm the site still builds with a single UIs group.
