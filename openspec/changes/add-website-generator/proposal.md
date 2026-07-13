# Proposal: add-website-generator

## Why

The awesome-openspec README holds 100+ curated entries, but as a flat Markdown file it offers no search, no sorting by popularity, and no live metadata — visitors cannot see which of the 77 GitHub repos are actively maintained or widely used. A generated website turns the list into a browsable catalog while the README stays the single lint-enforced source of truth, and gives the speclib org a public face at `speclib.github.io/awesome-openspec`.

## What Changes

- Extend the existing stats pipeline (`scripts/fetch-github-stats.js`) to emit **all** README entries as typed records (`repo`, `video`, `link`), not just GitHub repos. Repos are enriched with stars/pushed_at/language/archived via the GitHub API; videos optionally enriched with view counts via the YouTube Data API when a `YOUTUBE_API_KEY` is present; plain links pass through as-is.
- Add an Astro static site (new `site/` directory) that consumes the generated entries JSON at build time and renders a catalog: repo cards with stars, plain rows for links/videos, client-side search, sort options (stars, A–Z, recently pushed), section filters, a "Last updated" timestamp, light/dark/system theme toggle, and language icons (English/Chinese) on entries.
- Add a GitHub Actions workflow that fetches stats, builds the site, and deploys to GitHub Pages — triggered by pushes to main, a daily cron, and manual dispatch. Generated data is never committed.
- README remains the source of truth and is not modified by this change (no breaking changes to existing lint rules or contribution flow).

## Capabilities

### New Capabilities

- `entry-extraction`: Parsing every README list entry (GitHub repos, YouTube videos, plain links) into a typed JSON dataset with section grouping and metadata enrichment.
- `website-generation`: Building the static catalog site from the entries dataset — cards, search, sorting, filtering, theming, language icons, last-updated display.
- `site-deployment`: Automated build and deployment to GitHub Pages on push, daily schedule, and manual trigger.

### Modified Capabilities

<!-- No existing spec's requirements change. The existing github-stats behavior is subsumed by entry-extraction; current specs (alphabetical-ordering, ci-integration, custom-rules, etc.) govern the README and linting, which are untouched. -->

## Impact

- **Code**: `scripts/fetch-github-stats.js` extended (or superseded by a new extraction script); new `site/` Astro project; new `.github/workflows/deploy-site.yml`.
- **Dependencies**: Astro (dev dependency, isolated in `site/`); no new runtime dependencies for the extraction script.
- **Systems**: GitHub Pages must be enabled with "GitHub Actions" as the source (one-time repo setting). Optional `YOUTUBE_API_KEY` repository secret for video view counts; site degrades gracefully without it.
- **APIs consumed**: GitHub REST API (existing pattern, ~77 calls/build with `GITHUB_TOKEN`), YouTube Data API v3 (optional, ~5 calls/build).
