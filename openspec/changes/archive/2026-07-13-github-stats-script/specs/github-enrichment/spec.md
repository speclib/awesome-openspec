## ADDED Requirements

### Requirement: Fetch enriched metadata per repo
The script SHALL call `GET https://api.github.com/repos/{owner}/{repo}` for each extracted repo and collect the following fields: `stargazers_count`, `pushed_at`, `description`, `language`, `license.spdx_id`, `topics`, `archived`, `open_issues_count`.

#### Scenario: Successful API response
- **WHEN** the GitHub API returns a 200 response for a repo
- **THEN** the script SHALL map the response fields to the output record: `stars`, `pushed_at`, `description`, `language`, `license`, `topics`, `archived`, `open_issues_count`

#### Scenario: Repo not found (404)
- **WHEN** the GitHub API returns a 404 for a repo
- **THEN** the script SHALL log a warning and include the repo in output with all metadata fields set to `null` and an `error` field set to `"not_found"`

#### Scenario: Rate limit exceeded (403)
- **WHEN** the GitHub API returns a 403 with rate limit headers
- **THEN** the script SHALL log a warning with the reset time and stop fetching further repos, outputting already-fetched data

### Requirement: Support authenticated requests
The script SHALL use the `GITHUB_TOKEN` environment variable as a Bearer token if set.

#### Scenario: Token provided
- **WHEN** `GITHUB_TOKEN` is set in the environment
- **THEN** the script SHALL include `Authorization: Bearer <token>` in all API requests

#### Scenario: No token provided
- **WHEN** `GITHUB_TOKEN` is not set
- **THEN** the script SHALL log a warning about the 60 requests/hour rate limit and proceed with unauthenticated requests

### Requirement: Sequential API calls
The script SHALL make API calls sequentially (one at a time), not in parallel.

#### Scenario: Processing order
- **WHEN** the script processes 35 repos
- **THEN** it SHALL call the API for each repo one after another, logging progress (e.g., `[12/35] Fetching ToruAI/openspec-ui...`)
