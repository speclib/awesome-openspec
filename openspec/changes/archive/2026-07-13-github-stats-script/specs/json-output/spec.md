## ADDED Requirements

### Requirement: Write structured JSON output
The script SHALL write a JSON file to `data/repos.json` containing a `generated_at` ISO 8601 timestamp and a `repos` array of enriched repo records.

#### Scenario: Output file structure
- **WHEN** the script completes successfully
- **THEN** `data/repos.json` SHALL contain:
  ```json
  {
    "generated_at": "2026-04-13T12:00:00.000Z",
    "repos": [...]
  }
  ```

#### Scenario: Repo record structure
- **WHEN** a repo is successfully enriched
- **THEN** each entry in the `repos` array SHALL contain: `name`, `owner`, `repo`, `url`, `section`, `stars`, `pushed_at`, `description`, `language`, `license`, `topics`, `archived`, `open_issues_count`

#### Scenario: Failed repo record
- **WHEN** a repo API call failed
- **THEN** the entry SHALL contain `name`, `owner`, `repo`, `url`, `section`, `error`, and all metadata fields set to `null`

### Requirement: Create data directory if missing
The script SHALL create the `data/` directory if it does not exist before writing.

#### Scenario: First run
- **WHEN** `data/` does not exist
- **THEN** the script SHALL create it and write `data/repos.json` without error

### Requirement: Pretty-print JSON
The script SHALL write JSON with 2-space indentation for readability and clean diffs.

#### Scenario: Formatted output
- **WHEN** the script writes `data/repos.json`
- **THEN** the file SHALL use `JSON.stringify(data, null, 2)` formatting
