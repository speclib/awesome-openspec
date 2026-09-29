## MODIFIED Requirements

### Requirement: Alphabetical ordering within sections
All entries within each list SHALL be sorted alphabetically by their display
name, using case-insensitive comparison. WHERE a section is divided into
subsections, each subsection's list SHALL be ordered independently, and the
section as a whole is NOT required to read alphabetically across its
subsection boundaries.

#### Scenario: Tools section ordering
- **WHEN** viewing the Tools section
- **THEN** entries SHALL appear in alphabetical order (e.g., OmniDev Kit before openspec-playwright before ralphy-openspec)

#### Scenario: Integrations section ordering
- **WHEN** viewing the OpenSpec as Integration or Plugin section
- **THEN** entries SHALL appear in alphabetical order (e.g., ClawSpec before claude-plugin-design before Flokay)

#### Scenario: Ordering restarts at each subsection
- **WHEN** viewing the UIs section, whose last Terminal entry is "specgetty" and whose first Web & Desktop entry is "openspec-ui"
- **THEN** both lists SHALL be internally alphabetical, and "openspec-ui" following "specgetty" across the subsection boundary SHALL NOT be reported as an ordering violation

## ADDED Requirements

### Requirement: Alphabetical ordering of subsection headings
WHERE a section is divided into `### ` subsections, those subsection headings
SHALL appear in alphabetical order by heading text, using case-insensitive
comparison. This ordering is a README convention and is NOT enforced by a lint
rule: the custom rules inspect list items, not headings.

#### Scenario: UIs subsections read alphabetically
- **WHEN** viewing the UIs section
- **THEN** its subsection headings SHALL appear in the order Mobile, Terminal, Web & Desktop

#### Scenario: A new subsection is inserted rather than appended
- **WHEN** a subsection is added to a section that already has subsections
- **THEN** it SHALL be placed at its alphabetical position rather than at the end of the section
