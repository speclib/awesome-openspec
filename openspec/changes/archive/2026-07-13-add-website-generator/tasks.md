# Tasks: add-website-generator

## 1. Entry extraction script

- [x] 1.1 Create `scripts/fetch-entries.js`: parse all README sections into typed entries (repo/video/link), reusing the section/link parsing approach from `fetch-github-stats.js`
- [x] 1.2 Implement type derivation rules (GitHub root repo links → repo; youtube.com/watch and youtu.be → video with extracted video_id; everything else including GitHub deep links → link)
- [x] 1.3 Implement language-marker detection: `(Chinese)`, `(Chinese/English)`, `(Taiwanese)` → `language_tag: "zh"`, strip marker from description; default `"en"`
- [x] 1.4 Enrich repo entries via GitHub API (stars, pushed_at, language, archived) with per-repo failure tolerance; add dataset-level `generated_at`
- [x] 1.5 Add optional YouTube enrichment: batch `videos.list?part=statistics` call when `YOUTUBE_API_KEY` is set; fail-open otherwise
- [x] 1.6 Emit `data/entries.json`; skip-and-warn on unparseable list lines; verify `data/` remains gitignored
- [x] 1.7 Run the script against the current README and sanity-check the output (all sections present, ~77 repos enriched, videos and links typed correctly)

## 2. Astro site scaffold

- [x] 2.1 Scaffold Astro project in `site/` with its own package.json; pin Astro major version; set `site: 'https://speclib.github.io'` and `base: '/awesome-openspec'`
- [x] 2.2 Load `site/src/data/entries.json` at build time (copied from `data/entries.json`); add a small sample/fixture dataset for local dev without running extraction
- [x] 2.3 Build the page layout: header with title, tagline, search input, last-updated timestamp from `generated_at`; footer linking back to the GitHub repo

## 3. Catalog UI

- [x] 3.1 Repo card component: name, description, star count, primary language, relative pushed_at, archived badge, language icon (zh/en)
- [x] 3.2 List-row component for video and link entries (views shown for videos when present, no stars anywhere)
- [x] 3.3 Section rendering: entries grouped by README section, section anchor nav or filter chips (All + per-section)
- [x] 3.4 Search island: client-side substring filter over name+description across all sections, live as-you-type
- [x] 3.5 Sort controls: stars descending (default), name A–Z, recently pushed — repo entries only; videos/links keep section order
- [x] 3.6 Theme toggle: light/dark/system with localStorage persistence and inline head script applying `data-theme` before first paint; system mode follows `prefers-color-scheme`
- [x] 3.7 Visual polish pass: minimal-technical look, responsive layout, verify readable contrast in both themes

## 4. Deployment workflow

- [x] 4.1 Create `.github/workflows/deploy-site.yml`: triggers push-to-main, daily cron (`17 4 * * *`), workflow_dispatch; concurrency group with cancel-in-progress
- [x] 4.2 Pipeline steps: checkout → run `scripts/fetch-entries.js` (GITHUB_TOKEN, optional YOUTUBE_API_KEY) → copy entries.json into `site/src/data/` → `npm ci && npm run build` in `site/` → upload-pages-artifact → deploy-pages with required permissions
- [x] 4.3 Enable GitHub Pages with "GitHub Actions" build type on speclib/awesome-openspec (gh api or settings UI)

## 5. Verification and docs

- [x] 5.1 Local end-to-end check: extraction → build → `astro preview`, verify search, all three sort orders, section filters, theme toggle persistence, language icons, no `(Chinese)` text remnants
- [x] 5.2 Deploy via workflow_dispatch and verify the live site at https://speclib.github.io/awesome-openspec (assets resolve under base path, stars visible, last-updated present)
- [x] 5.3 Trigger a second run and confirm no generated files were committed and the deployment concurrency behaves
- [x] 5.4 Add a "Website" link/badge to README intro and a short section in CONTRIBUTING.md noting the site is generated from README (no manual site edits)
