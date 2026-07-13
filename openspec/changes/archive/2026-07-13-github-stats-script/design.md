## Context

The awesome-openspec README contains ~35 GitHub repository links organized under section headers (UIs, Tools, Plugins, etc.). Some links point to specific files within repos. Non-GitHub links (YouTube, Discord, npm) are also present and must be skipped. The project already uses Node.js (package.json exists for remark linting).

## Goals / Non-Goals

**Goals:**
- Parse all GitHub repo URLs from README.md, preserving section and display name
- Deduplicate repos that appear in multiple sections (keep first occurrence's section)
- Resolve file-path URLs to their repo root
- Fetch enriched metadata via GitHub REST API v3
- Output a single `data/repos.json` with generation timestamp
- Support authenticated and unauthenticated usage

**Non-Goals:**
- No frontend implementation (separate change)
- No GitHub Action / CI automation (manual runs for now)
- No caching layer or incremental updates
- No npm dependencies — use Node.js built-in `fetch` only

## Decisions

### 1. Single-file Node.js script with no dependencies

**Decision**: One file at `scripts/fetch-github-stats.js`, zero npm dependencies.

**Rationale**: Node 18+ has built-in `fetch`. The README parsing is simple regex work. Adding `@octokit/rest` or a markdown parser would be overkill for extracting `github.com/{owner}/{repo}` patterns from a flat markdown file.

**Alternative considered**: Using `remark` (already in devDependencies) to parse the AST — more robust but significantly more complex for a simple link extraction task.

### 2. Regex-based README parsing with section tracking

**Decision**: Read README.md line by line. Track current section via `## Header` lines. Extract GitHub links via regex matching `github.com/{owner}/{repo}`.

**Rationale**: The README follows a strict awesome-list format. Section headers are always `##`. Links are always `[name](url)`. This is reliable enough without a full markdown parser.

### 3. Sequential API calls with rate-limit awareness

**Decision**: Hit `GET /repos/{owner}/{repo}` sequentially (one at a time), not in parallel.

**Rationale**: With ~35 repos, sequential calls take ~10-15 seconds — acceptable for a manual script. Parallel calls risk hitting secondary rate limits. If `GITHUB_TOKEN` is set, use it; otherwise warn about the 60 req/hr limit.

### 4. Graceful error handling per repo

**Decision**: If a repo fetch fails (404, rate limit, network error), log a warning and include the repo in the output with `null` metadata fields and an `error` field.

**Rationale**: One deleted repo shouldn't break the entire data file. The frontend can handle missing data.

## Risks / Trade-offs

- **[Regex fragility]** → The regex assumes standard awesome-list markdown formatting. Mitigation: the README is linted by remark-lint, enforcing consistent formatting.
- **[Rate limits without token]** → 60 requests/hr is tight for 35 repos. Mitigation: script warns on start if no token is set, and stops gracefully if rate-limited.
- **[Stale data]** → JSON is a point-in-time snapshot. Mitigation: `generated_at` timestamp in output; future change can add CI automation.
- **[Repo renames/transfers]** → GitHub API follows redirects, so this is handled transparently. The output will reflect the current canonical owner/repo.
