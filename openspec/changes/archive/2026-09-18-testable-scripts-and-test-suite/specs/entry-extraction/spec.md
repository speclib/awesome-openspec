## ADDED Requirements

### Requirement: Extraction behavior is covered by tests
The extraction behavior SHALL be verified by automated tests running against
fixtures, covering entry classification, language markers, and the enrichment
failure path.

#### Scenario: Classification of the three entry types
- **WHEN** the suite parses a fixture holding a GitHub root link, a youtu.be link, and a GitHub `blob/` deep link
- **THEN** the records SHALL carry `type` of `repo`, `video`, and `link` respectively

#### Scenario: Language marker stripped and tagged
- **WHEN** the suite parses an entry whose description ends with `(Chinese)`
- **THEN** the record SHALL have `language_tag: "zh"` and a description without the marker

#### Scenario: One repo failing enrichment does not abort the run
- **WHEN** the stubbed client returns an error for one repository and success for the rest
- **THEN** the run SHALL complete, emitting that entry without enrichment fields
