# Design: add-website-generator

## Context

The repo curates 100+ entries in `README.md`, enforced by remark lint rules (150-char lines, alphabetical order per section). An existing script (`scripts/fetch-github-stats.js`, zero runtime deps, Node 20+) already parses README sections, extracts GitHub links, enriches them via the GitHub REST API, and writes `data/repos.json` (gitignored). A lint workflow runs on PRs. GitHub Pages for the `speclib` org is unused for this repo.

Explored and decided in discovery (2026-07-13):
- Approach C chosen: lightweight SSG with a nice theme, over a bare single-file page (A) and over adopting an awesome-list generator like hecat (B, rejected: inverts data ownership away from the README).
- Hosting: `https://speclib.github.io/awesome-openspec` (project page, no custom domain).
- Stars are repo-only; videos/links are listed without stars. YouTube view counts are optional enrichment.
- Rebuild daily plus on push to main.

## Goals / Non-Goals

**Goals:**
- Auto-generated catalog site with search, multiple sort orders, section filters, star counts, last-updated timestamp, light/dark/system theme, and language icons.
- README stays the single source of truth; contributors never touch site data by hand.
- Zero manual publish steps after the one-time Pages setting.
- Graceful degradation when optional API keys are absent.

**Non-Goals:**
- No custom domain, no analytics, no comments/voting.
- No change to README structure, lint rules, or contribution flow.
- No server-side or client-side data fetching at page view time (fully static).
- No i18n of the site UI itself (language icons annotate entries, they don't translate the site).

## Decisions

### D1: Astro as the SSG
Astro ships zero JS by default and hydrates only the search/sort/filter island. Content-focused, loads local JSON natively at build time, first-class `base` config for project pages. Alternatives: Eleventy (weaker component/theming story), VitePress (docs-shaped, fights the catalog layout), Next.js (overweight for a static catalog).

### D2: Extraction script emits typed entries; keep it dependency-free
Extend the existing parse-enrich-write pattern into `scripts/fetch-entries.js` producing `data/entries.json`:

```json
{
  "generated_at": "ISO-8601",
  "sections": [
    { "title": "UIs", "entries": [
      { "type": "repo",  "name": "...", "url": "...", "description": "...",
        "language_tag": "en|zh", "stars": 0, "pushed_at": "...",
        "language": "...", "archived": false },
      { "type": "video", "name": "...", "url": "...", "description": "...",
        "video_id": "...", "views": 12345 },
      { "type": "link",  "name": "...", "url": "...", "description": "..." }
    ]}
  ]
}
```

- `type` derivation: `github.com/<owner>/<repo>` → `repo`; `youtube.com/watch` or `youtu.be` → `video`; everything else → `link`. GitHub links with deeper paths (e.g. a `blob/...` cheatsheet) are `link`, not `repo`.
- `language_tag` derivation: `(Chinese)`, `(Chinese/English)`, `(Taiwanese)` markers in the README description → `zh`; default `en`. The marker is stripped from the site description and rendered as an icon instead.
- `fetch-github-stats.js` stays for now (the stats capability spec references it); `fetch-entries.js` reuses its parsing/fetch helpers. Node's built-in `fetch`; no npm deps.

### D3: Optional YouTube enrichment
If `YOUTUBE_API_KEY` is set, one `videos.list?part=statistics` batch call fetches view counts for all video IDs. Absent key or API error → videos emit without `views`, build continues. Mirrors the existing GITHUB_TOKEN-optional pattern.

### D4: Client-side search/sort over embedded JSON
~110 entries is tiny: embed the dataset in the page and filter/sort in a small vanilla-JS (or minimal framework) island. No Pagefind, no Fuse.js unless fuzzy matching proves necessary. Sort options: stars (default, repos ranked; non-repos keep section order below), A–Z, recently pushed. Filter: section chips. Search: substring match on name + description.

### D5: Theming via CSS custom properties + `prefers-color-scheme`
Three-way toggle (light/dark/system) stored in `localStorage`, applied via a `data-theme` attribute set by an inline head script (prevents flash of wrong theme). System mode delegates to the media query.

### D6: Site lives in `site/`, its own package.json
Keeps Astro deps out of the root package.json (which stays lint-only). CI runs `npm ci` in both root (extraction, no deps needed) and `site/`.

### D7: Deploy via official Pages actions
Workflow `deploy-site.yml`: triggers `push: main`, `schedule: cron '17 4 * * *'`, `workflow_dispatch`. Jobs: checkout → run extraction (GITHUB_TOKEN, optional YOUTUBE_API_KEY) → copy `data/entries.json` into `site/src/data/` → `astro build` (`site: 'https://speclib.github.io'`, `base: '/awesome-openspec'`) → `actions/upload-pages-artifact` → `actions/deploy-pages`. Concurrency group `pages`, `cancel-in-progress: true`. Generated JSON is never committed.

## Risks / Trade-offs

- [GitHub API rate limits on build] → Built-in `GITHUB_TOKEN` allows 1,000 req/hr per repo; ~77 calls/build is far under. Sequential fetching (existing pattern) avoids abuse detection.
- [Scheduled workflows auto-disabled after 60 days of repo inactivity] → Repo is active; if it quiets down, add a keepalive step or re-enable manually. Accepted.
- [Astro major-version churn] → Site is small (~2 components + 1 island); upgrades are cheap. Pin major version in `site/package.json`.
- [README parse drift: new section names or entry formats] → Parser keys off `## ` headings and `- [name](url) - desc` items, same as lint rules enforce; lint failing on malformed entries protects the parser. Unknown formats are skipped with a build log warning, not a failure.
- [YouTube key quota/expiry] → Enrichment is optional and fail-open; worst case videos show without view counts.
- [Base-path 404s (classic project-page gotcha)] → Set Astro `base`; verify all asset/internal URLs in a preview build task.

## Migration Plan

1. Land extraction script + site + workflow in one change; merge to main.
2. One-time: enable Pages with "GitHub Actions" source (`gh api repos/speclib/awesome-openspec/pages -X POST -f build_type=workflow` or via settings UI).
3. First deploy validates the pipeline; add `YOUTUBE_API_KEY` secret later at leisure.
4. Rollback: disable the workflow or unpublish Pages; README/list workflow is unaffected either way.

## Open Questions

- Card visual design (accent colors, typography) — resolved during implementation; keep it minimal-technical, speclib branding can come later.
- Whether `fetch-github-stats.js` should be folded into `fetch-entries.js` and its spec updated — deferred; revisit when archiving this change.
