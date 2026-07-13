## Why

The awesome-openspec README lists ~35 GitHub repositories, but there's no way to see which projects are active or popular without clicking each link. A script that fetches enriched GitHub metadata (stars, last push date, description, language, etc.) into a JSON file enables a future frontend to display sortable, filterable project data — and signals which projects are alive vs abandoned.

## What Changes

- Add a Node.js script (`scripts/fetch-github-stats.js`) that parses the README, extracts all GitHub repo URLs, calls the GitHub REST API, and writes enriched data to `data/repos.json`.
- The script preserves which awesome-list section each repo belongs to and deduplicates repos linked multiple times (e.g., OpenSpec itself).
- Supports optional `GITHUB_TOKEN` env var for higher rate limits.
- File-path links (e.g., `/blob/main/docs/...`) are resolved to their repo root.

## Capabilities

### New Capabilities
- `readme-parsing`: Extract GitHub repo URLs from README.md with section context and display names.
- `github-enrichment`: Fetch enriched metadata per repo from the GitHub REST API (stars, pushed_at, description, language, license, topics, archived, open_issues_count).
- `json-output`: Write structured JSON to `data/repos.json` with a generation timestamp and per-repo enriched records.

### Modified Capabilities

_None — this is a new standalone script._

## Impact

- New files: `scripts/fetch-github-stats.js`, `data/repos.json`
- No changes to existing code or dependencies (uses Node.js built-in `fetch`)
- Requires Node.js 18+ (already present in the project)
- Optional: `GITHUB_TOKEN` env var for authenticated API access (5,000 req/hr vs 60)
