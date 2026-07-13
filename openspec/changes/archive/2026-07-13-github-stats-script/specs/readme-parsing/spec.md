## ADDED Requirements

### Requirement: Extract GitHub repo URLs from README
The script SHALL read `README.md` from the project root and extract all URLs matching the pattern `https://github.com/{owner}/{repo}`.

#### Scenario: Standard repo link
- **WHEN** the README contains `[openspec-ui](https://github.com/ToruAI/openspec-ui)`
- **THEN** the script SHALL extract owner `ToruAI` and repo `openspec-ui`

#### Scenario: File-path link resolved to repo root
- **WHEN** the README contains `https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md`
- **THEN** the script SHALL extract owner `Fission-AI` and repo `OpenSpec`, discarding the file path

#### Scenario: Non-GitHub links are skipped
- **WHEN** the README contains links to youtube.com, discord.gg, npmjs.com, dev.to, or any non-github.com domain
- **THEN** the script SHALL skip those links without error

### Requirement: Preserve section context
The script SHALL track the current `## Section` header and associate each extracted repo with its section name.

#### Scenario: Repos grouped by section
- **WHEN** a repo link appears under the `## UIs` header
- **THEN** the extracted repo record SHALL have `section` set to `"UIs"`

#### Scenario: Section changes on next header
- **WHEN** the README transitions from `## UIs` to `## Tools`
- **THEN** repos after the `## Tools` header SHALL have `section` set to `"Tools"`

### Requirement: Capture display name
The script SHALL extract the markdown link text as the `name` field for each repo.

#### Scenario: Link text becomes name
- **WHEN** the README contains `[Specboard](https://github.com/sflueckiger/specboard)`
- **THEN** the repo record SHALL have `name` set to `"Specboard"`

### Requirement: Deduplicate repos
The script SHALL deduplicate repos that appear multiple times in the README, keeping the first occurrence.

#### Scenario: Same repo linked twice
- **WHEN** `Fission-AI/OpenSpec` appears under both "Official Resources" and another section
- **THEN** only one record SHALL appear in the output, with the section from the first occurrence
