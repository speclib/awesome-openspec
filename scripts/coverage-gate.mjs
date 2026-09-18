#!/usr/bin/env node
// coverage-gate.mjs <lcov-file>
//
// Enforces the ship gate's coverage thresholds against an lcov report:
//   - 70% line coverage overall
//   - 80% line coverage on each core package (rules/, scripts/)
//
// Exits non-zero, with a per-package table, when a threshold is not met.

import { readFileSync } from 'node:fs';

const OVERALL_MINIMUM = 70;
const CORE_MINIMUM = 80;
const CORE_PACKAGES = ['rules', 'scripts'];

/**
 * Parse an lcov report into one {file, found, hit} record per source file.
 */
export function parseLcov(text) {
  const records = [];
  let current = null;

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('SF:')) {
      current = { file: line.slice(3), found: 0, hit: 0 };
    } else if (current && line.startsWith('LF:')) {
      current.found = Number(line.slice(3));
    } else if (current && line.startsWith('LH:')) {
      current.hit = Number(line.slice(3));
    } else if (line === 'end_of_record' && current) {
      records.push(current);
      current = null;
    }
  }

  return records;
}

/**
 * Is this record part of the named package directory?
 */
export function inPackage(record, pkg) {
  return record.file.split('/').includes(pkg);
}

/**
 * Is this record a test file rather than code under test?
 */
export function isTest(record) {
  const segments = record.file.split('/');
  return segments.includes('test') || segments.includes('tests')
    || /\.test\.(m?js)$/.test(record.file);
}

export function percentage(records) {
  const found = records.reduce((total, r) => total + r.found, 0);
  const hit = records.reduce((total, r) => total + r.hit, 0);
  return { found, hit, percent: found === 0 ? 0 : (hit / found) * 100 };
}

/**
 * Score an lcov report against the thresholds. Pure: no I/O, no exit.
 */
export function evaluate(lcovText) {
  const records = parseLcov(lcovText).filter((r) => !isTest(r));

  const rows = [];
  let failed = false;

  const overall = percentage(records);
  rows.push({ label: 'overall', result: overall, minimum: OVERALL_MINIMUM });
  if (overall.percent < OVERALL_MINIMUM) failed = true;

  for (const pkg of CORE_PACKAGES) {
    const result = percentage(records.filter((r) => inPackage(r, pkg)));
    rows.push({ label: `${pkg}/`, result, minimum: CORE_MINIMUM });
    if (result.percent < CORE_MINIMUM) failed = true;
  }

  return { rows, failed, empty: records.length === 0 };
}

/**
 * Print the per-scope table and return the process exit code.
 */
export function report({ rows, failed, empty }, out = console) {
  out.log('');
  out.log('Coverage gate');
  out.log('  scope      lines      covered   minimum   result');
  for (const { label, result, minimum } of rows) {
    const ok = result.percent >= minimum;
    out.log(
      '  ' + label.padEnd(11)
      + String(result.found).padEnd(11)
      + (result.percent.toFixed(1) + '%').padEnd(10)
      + (minimum + '%').padEnd(10)
      + (ok ? 'pass' : 'FAIL')
    );
  }
  out.log('');

  if (empty) {
    out.error('coverage-gate: the report covers no source files, so there are no tests yet.');
  }
  if (failed) {
    out.error('coverage-gate: thresholds not met, refusing to pass the gate.');
    return 1;
  }
  out.log('coverage-gate: all thresholds met.');
  return 0;
}

if (process.argv[1] && import.meta.filename === process.argv[1]) {
  const lcovPath = process.argv[2];
  if (!lcovPath) {
    console.error('usage: coverage-gate.mjs <lcov-file>');
    process.exit(2);
  }
  process.exit(report(evaluate(readFileSync(lcovPath, 'utf8'))));
}
