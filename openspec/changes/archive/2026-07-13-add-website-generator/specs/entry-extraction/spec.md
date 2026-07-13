# entry-extraction Specification

## ADDED Requirements

### Requirement: All README entries are extracted as typed records
The extraction script SHALL parse every list entry of the form `- [name](url) - description` from README.md sections and emit a JSON dataset (`data/entries.json`) grouping entries by section in README order. Each entry SHALL carry a `type` of `repo` (GitHub `owner/repo` root links), `video` (youtube.com/watch or youtu.be links), or `link` (everything else, including GitHub deep links such as `blob/...` paths).

#### Scenario: GitHub repo entry
- **WHEN** the README contains `- [Spek](https://github.com/spekhq/spek) - ...` in the UIs section
- **THEN** entries.json contains a `repo` entry named "Spek" in the "UIs" section

#### Scenario: YouTube entry
- **WHEN** the README contains a `youtu.be` or `youtube.com/watch` link in the Videos section
- **THEN** the entry has `type: "video"` and its extracted `video_id`

#### Scenario: Non-repo GitHub deep link
- **WHEN** an entry URL points to `github.com/<owner>/<repo>/blob/...`
- **THEN** the entry has `type: "link"` and is not enriched with repo stats

### Requirement: Repo entries are enriched with GitHub metadata
The extraction script SHALL enrich each `repo` entry with `stars`, `pushed_at`, `language`, and `archived` from the GitHub REST API, and SHALL record a dataset-level `generated_at` ISO-8601 timestamp.

#### Scenario: Successful enrichment
- **WHEN** the script runs with a valid `GITHUB_TOKEN`
- **THEN** every `repo` entry includes a numeric `stars` field and the dataset includes `generated_at`

#### Scenario: Individual repo fetch failure
- **WHEN** the GitHub API returns an error for one repository
- **THEN** the script logs a warning, emits that entry without enrichment fields, and continues with remaining entries

### Requirement: Video entries are optionally enriched with view counts
WHERE a `YOUTUBE_API_KEY` environment variable is set, the extraction script SHALL fetch view counts for all video entries via the YouTube Data API v3 and add a `views` field. IF the key is absent or the API call fails, the script SHALL emit video entries without `views` and exit successfully.

#### Scenario: Key present
- **WHEN** the script runs with `YOUTUBE_API_KEY` set
- **THEN** video entries include a numeric `views` field

#### Scenario: Key absent
- **WHEN** the script runs without `YOUTUBE_API_KEY`
- **THEN** video entries are emitted without `views` and the exit code is 0

### Requirement: Language markers become structured tags
The extraction script SHALL detect trailing language markers in descriptions — `(Chinese)`, `(Chinese/English)`, `(Taiwanese)` and equivalents — setting `language_tag: "zh"` for those entries and `"en"` otherwise, and SHALL strip the marker text from the emitted description.

#### Scenario: Chinese-marked entry
- **WHEN** an entry description ends with `(Chinese)`
- **THEN** the entry has `language_tag: "zh"` and its description no longer contains the marker

#### Scenario: Unmarked entry
- **WHEN** an entry description has no language marker
- **THEN** the entry has `language_tag: "en"`

### Requirement: Unparseable entries do not break the build
The extraction script SHALL skip list lines that do not match the entry format, logging a warning with the line content, and SHALL NOT fail the build because of them.

#### Scenario: Malformed line
- **WHEN** a section contains a list line without a leading link
- **THEN** the script logs a warning naming that line and completes successfully
