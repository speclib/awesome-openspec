## ADDED Requirements

### Requirement: Subsection headings do not create sections
The script SHALL treat only `## ` headings as section boundaries. A `### `
subsection heading SHALL NOT start a new section, and entries beneath it SHALL
inherit the `section` of the enclosing `## ` heading.

#### Scenario: Entry under a subsection keeps the parent section
- **WHEN** the README contains `### Terminal` under `## UIs`, with `- [specgetty](https://github.com/speclib/specgetty) - ...` beneath it
- **THEN** the extracted record SHALL have `section` set to `"UIs"`

#### Scenario: Subsection heading is not emitted as an entry
- **WHEN** the parser encounters a `### ` heading line
- **THEN** it SHALL skip the line without warning and without adding a record
