# Add a Mobile subsection to UIs and sort the UIs subsections

Schema: `tinychange`, from https://github.com/speclib/openspec-tinychange-schema
(install it with the guide in that repo's AGENT_INSTALL.md).

Bean: awesome-openspec-0u7g (01 List curation and growth).

Extends the archived change `2026-09-18-split-uis-web-and-terminal`, which
established that `### ` subsections are a README-only device: `fetch-entries.js`
reads `## ` headings only, so every UIs entry keeps `section: "UIs"` on the site.

## 1. Implementation

- [x] 1.1 In `README.md`, add a `### Mobile` subsection under `## UIs` holding `- [specgetty-mobile](https://github.com/speclib/specgetty-mobile) - Android reader for OpenSpec specs, changes and tasks in a cloned repository.` (144 characters, within the 150 limit).
- [x] 1.2 Reorder the UIs subsections alphabetically to `### Mobile`, `### Terminal`, `### Web & Desktop`, moving each subsection's entries with its heading and leaving the entries within each list untouched.
- [x] 1.3 Leave the `## Contents` list untouched. The TOC lists `## ` sections only, and awesome-lint's toc rule does not ask for subsections.
- [x] 1.4 In `CONTRIBUTING.md`, name all three subsections in the ordering guideline and add that the subsection headings themselves are kept in alphabetical order.

## 2. Verification

- [x] 2.1 Capture the `npm run lint` baseline on an unedited `README.md` first, then run it again after the edit and confirm no NEW warnings. Note that remark exits 0 on warnings, so read the output rather than trusting the exit code.
- [x] 2.2 Run `node scripts/fetch-entries.js` and confirm `data/entries.json` has 10 entries under section `"UIs"`, specgetty-mobile among them, and that no "Skipping unparseable entry line" warning was printed for the `###` headings.
- [x] 2.3 Run `npm --prefix site run build` and confirm the site still builds with a single UIs group.
- [x] 2.4 Run `nix flake check`.
