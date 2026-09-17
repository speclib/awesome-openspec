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

const lcovPath = process.argv[2];
if (!lcovPath) {
  console.error('usage: coverage-gate.mjs <lcov-file>');
  process.exit(2);
}

/**
 * Parse an lcov report into one {file, found, hit} record per source file.
 */
function parseLcov(text) {
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
function inPackage(record, pkg) {
  return record.file.split('/').includes(pkg);
}

/**
 * Is this record a test file rather than code under test?
 */
function isTest(record) {
  const segments = record.file.split('/');
  return segments.includes('test') || segments.includes('tests')
    || /\.test\.(m?js)$/.test(record.file);
}

function percentage(records) {
  const found = records.reduce((total, r) => total + r.found, 0);
  const hit = records.reduce((total, r) => total + r.hit, 0);
  return { found, hit, percent: found === 0 ? 0 : (hit / found) * 100 };
}

const records = parseLcov(readFileSync(lcovPath, 'utf8')).filter(r => !isTest(r));

const rows = [];
let failed = false;

const overall = percentage(records);
rows.push(['overall', overall, OVERALL_MINIMUM]);
if (overall.percent < OVERALL_MINIMUM) failed = true;

for (const pkg of CORE_PACKAGES) {
  const result = percentage(records.filter(r => inPackage(r, pkg)));
  rows.push([`${pkg}/`, result, CORE_MINIMUM]);
  if (result.percent < CORE_MINIMUM) failed = true;
}

console.log('');
console.log('Coverage gate');
console.log('  scope      lines      covered   minimum   result');
for (const [label, result, minimum] of rows) {
  const ok = result.percent >= minimum;
  console.log(
    '  ' + label.padEnd(11)
    + String(result.found).padEnd(11)
    + (result.percent.toFixed(1) + '%').padEnd(10)
    + (minimum + '%').padEnd(10)
    + (ok ? 'pass' : 'FAIL')
  );
}
console.log('');

if (records.length === 0) {
  console.error('coverage-gate: the report covers no source files, so there are no tests yet.');
}

if (failed) {
  console.error('coverage-gate: thresholds not met, refusing to pass the gate.');
  process.exit(1);
}

console.log('coverage-gate: all thresholds met.');
