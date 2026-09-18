# ship-gate Specification

## Purpose
TBD - created by archiving change testable-scripts-and-test-suite. Update Purpose after archive.

## Requirements

### Requirement: Coverage thresholds gate the ship
`nix flake check` SHALL fail unless line coverage is at least 70% overall and at
least 80% for each core package (`rules/` and `scripts/`). Test files SHALL be
excluded from both the numerator and the denominator.

#### Scenario: Coverage below the overall threshold
- **WHEN** the suite covers 60% of lines overall
- **THEN** the gate SHALL report the shortfall per scope and exit non-zero

#### Scenario: Core package below its threshold
- **WHEN** overall coverage is 75% but `rules/` is at 70%
- **THEN** the gate SHALL fail, naming `rules/` as the scope that fell short

#### Scenario: All thresholds met
- **WHEN** overall coverage is 83% and both core packages are above 80%
- **THEN** the gate SHALL report every scope as passing and exit 0

#### Scenario: Test files do not inflate coverage
- **WHEN** the lcov report includes records for files under `test/`
- **THEN** those records SHALL be excluded before any percentage is computed

### Requirement: A failing gate blocks the ship before it mutates anything
WHEN the gate fails, `scripts/ship-change.sh` SHALL exit before archiving the
change, committing, or pushing.

#### Scenario: Gate fails mid-ship
- **WHEN** `nix flake check` exits non-zero during a ship
- **THEN** the change SHALL remain in `openspec/changes/`, and no commit SHALL be created
