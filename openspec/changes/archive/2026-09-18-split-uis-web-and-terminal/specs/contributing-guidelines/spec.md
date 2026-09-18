## MODIFIED Requirements

### Requirement: Contribution guidelines reflect alphabetical ordering
CONTRIBUTING.md SHALL instruct contributors to add new entries in alphabetical
order within the relevant section, and WHERE that section has subsections, to
add the entry to the subsection that matches the resource and to order it
within that subsection.

#### Scenario: Contributor reads ordering instructions
- **WHEN** a contributor reads CONTRIBUTING.md
- **THEN** they SHALL find instructions to add entries in alphabetical order, not at the end of the section

#### Scenario: Contributor adds a terminal UI
- **WHEN** a contributor reads CONTRIBUTING.md before adding a terminal-based tool to the UIs section
- **THEN** they SHALL find instructions telling them to place it in the Terminal subsection rather than at the top of the UIs section
