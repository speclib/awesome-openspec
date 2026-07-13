# site-deployment Specification

## Purpose
Automated build and deployment of the catalog website to GitHub Pages.

## Requirements

### Requirement: Automated build and deploy to GitHub Pages
A GitHub Actions workflow SHALL run the extraction script and build the Astro site, then deploy the output to GitHub Pages using the official Pages actions (`upload-pages-artifact` + `deploy-pages`). Generated data files SHALL NOT be committed to the repository.

#### Scenario: Successful pipeline
- **WHEN** the workflow runs on main
- **THEN** a fresh entries.json is generated, the site builds, and the result is published to `https://speclib.github.io/awesome-openspec`

#### Scenario: No generated files committed
- **WHEN** the workflow completes
- **THEN** the repository history contains no new commit with entries.json or built site output

### Requirement: Triggers include push, daily schedule, and manual dispatch
The workflow SHALL trigger on pushes to main, on a daily cron schedule, and via `workflow_dispatch`, so star counts refresh at least daily without commits.

#### Scenario: Daily refresh
- **WHEN** the cron fires with no new commits since the last run
- **THEN** the site redeploys with freshly fetched star counts and a new `generated_at`

#### Scenario: Manual run
- **WHEN** a maintainer dispatches the workflow manually
- **THEN** the site rebuilds and redeploys

### Requirement: Concurrency safety
The workflow SHALL use a concurrency group so overlapping runs do not race deployments, cancelling superseded in-progress runs.

#### Scenario: Push during scheduled run
- **WHEN** a push triggers the workflow while a scheduled run is deploying
- **THEN** only one deployment wins and no partial/interleaved deploy occurs

### Requirement: Secrets are optional beyond the built-in token
The workflow SHALL authenticate GitHub API calls with the built-in `GITHUB_TOKEN` and SHALL pass `YOUTUBE_API_KEY` to the extraction step only if the secret exists. A missing YouTube key SHALL NOT fail the workflow.

#### Scenario: Without YouTube key
- **WHEN** the workflow runs in a repo without the `YOUTUBE_API_KEY` secret
- **THEN** the deploy succeeds and videos render without view counts
