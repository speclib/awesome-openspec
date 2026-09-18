## ADDED Requirements

### Requirement: Scripts are importable without side effects
Every module under `scripts/` SHALL be importable without performing file I/O,
network requests, or process termination. Work SHALL run only when the module is
the process entry point, or when an exported function is called explicitly.

#### Scenario: Importing a fetch script does nothing
- **WHEN** a test imports `scripts/fetch-entries.js`
- **THEN** no file SHALL be read or written, no network request SHALL be made, and the process SHALL NOT exit

#### Scenario: Importing the coverage gate does nothing
- **WHEN** a test imports `scripts/coverage-gate.mjs`
- **THEN** `process.argv` SHALL NOT be inspected and the process SHALL NOT exit

#### Scenario: Running from the command line is unchanged
- **WHEN** `node scripts/fetch-entries.js` is run
- **THEN** it SHALL read README.md, write `data/entries.json`, and exit 0 exactly as before this change

### Requirement: Side effects are redirectable for tests
The scripts SHALL accept their input path, output path, and network client as
optional parameters, defaulting to the values used by the command line.

#### Scenario: Parsing a fixture instead of the real README
- **WHEN** a test calls the parse function with a `readmePath` pointing at a fixture
- **THEN** the fixture SHALL be parsed and the repository's own README.md SHALL NOT be read

#### Scenario: Enrichment against a stubbed client
- **WHEN** a test calls an enrichment function with a `fetchImpl` returning canned responses
- **THEN** no request SHALL reach api.github.com and the canned values SHALL appear in the result
