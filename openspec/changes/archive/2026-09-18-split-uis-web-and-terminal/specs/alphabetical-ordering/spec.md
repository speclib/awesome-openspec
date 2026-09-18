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
- **WHEN** viewing the UIs section, whose last Web & Desktop entry is "Spek" and whose first Terminal entry is "dossier"
- **THEN** both lists SHALL be internally alphabetical, and "dossier" following "Spek" across the subsection boundary SHALL NOT be reported as an ordering violation
