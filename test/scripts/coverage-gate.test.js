import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseLcov, inPackage, isTest, percentage, evaluate, report,
} from '../../scripts/coverage-gate.mjs';

function lcov(records) {
  return records
    .map(({ file, found, hit }) => `SF:${file}\nLF:${found}\nLH:${hit}\nend_of_record`)
    .join('\n') + '\n';
}

/** Collects report() output instead of printing it. */
function collector() {
  const lines = [];
  const errors = [];
  return {
    log: (m = '') => lines.push(String(m)),
    error: (m = '') => errors.push(String(m)),
    lines, errors,
  };
}

test('parseLcov reads one record per source file', () => {
  const records = parseLcov(lcov([
    { file: '/w/rules/a.js', found: 10, hit: 5 },
    { file: '/w/scripts/b.js', found: 20, hit: 20 },
  ]));
  assert.equal(records.length, 2);
  assert.deepEqual(records[0], { file: '/w/rules/a.js', found: 10, hit: 5 });
  assert.equal(records[1].hit, 20);
});

test('parseLcov ignores unterminated and unknown lines', () => {
  const records = parseLcov('SF:/w/a.js\nLF:4\nLH:2\nBRDA:1,0,0,1\nend_of_record\nSF:/w/dangling.js\nLF:9\n');
  assert.equal(records.length, 1);
  assert.equal(records[0].file, '/w/a.js');
});

test('parseLcov returns nothing for an empty report', () => {
  assert.deepEqual(parseLcov(''), []);
});

test('inPackage matches a directory segment, not a substring', () => {
  const rec = { file: '/w/scripts/fetch.js' };
  assert.equal(inPackage(rec, 'scripts'), true);
  assert.equal(inPackage(rec, 'rules'), false);
  assert.equal(inPackage({ file: '/w/myscripts/x.js' }, 'scripts'), false);
});

test('isTest recognises test directories and .test.js files', () => {
  assert.equal(isTest({ file: '/w/test/a.js' }), true);
  assert.equal(isTest({ file: '/w/tests/a.js' }), true);
  assert.equal(isTest({ file: '/w/scripts/a.test.js' }), true);
  assert.equal(isTest({ file: '/w/scripts/a.mjs' }), false);
});

test('percentage sums lines and reports zero for an empty set', () => {
  assert.deepEqual(
    percentage([{ found: 10, hit: 5 }, { found: 10, hit: 10 }]),
    { found: 20, hit: 15, percent: 75 }
  );
  assert.deepEqual(percentage([]), { found: 0, hit: 0, percent: 0 });
});

test('evaluate passes when every scope clears its threshold', () => {
  const result = evaluate(lcov([
    { file: '/w/rules/a.js', found: 100, hit: 85 },
    { file: '/w/scripts/b.js', found: 100, hit: 82 },
  ]));
  assert.equal(result.failed, false);
  assert.equal(result.empty, false);
  assert.deepEqual(result.rows.map((r) => r.label), ['overall', 'rules/', 'scripts/']);
  assert.equal(report(result, collector()), 0);
});

test('evaluate fails when overall is below 70', () => {
  const result = evaluate(lcov([
    { file: '/w/rules/a.js', found: 100, hit: 60 },
    { file: '/w/scripts/b.js', found: 100, hit: 60 },
  ]));
  assert.equal(result.failed, true);
  assert.equal(result.rows[0].result.percent, 60);
});

test('evaluate fails on a core package even when overall passes', () => {
  const result = evaluate(lcov([
    { file: '/w/rules/a.js', found: 100, hit: 70 },
    { file: '/w/scripts/b.js', found: 300, hit: 270 },
  ]));
  const overall = result.rows.find((r) => r.label === 'overall');
  const rules = result.rows.find((r) => r.label === 'rules/');
  assert.ok(overall.result.percent >= 70, 'overall should clear its bar');
  assert.ok(rules.result.percent < 80, 'rules/ should fall short');
  assert.equal(result.failed, true);
});

test('test files are excluded from the totals', () => {
  const result = evaluate(lcov([
    { file: '/w/rules/a.js', found: 100, hit: 85 },
    { file: '/w/scripts/b.js', found: 100, hit: 85 },
    { file: '/w/test/huge.test.js', found: 1000, hit: 0 },
  ]));
  assert.equal(result.rows[0].result.found, 200);
  assert.equal(result.failed, false);
});

test('an empty report is flagged and fails', () => {
  const result = evaluate('');
  assert.equal(result.empty, true);
  assert.equal(result.failed, true);
  const out = collector();
  assert.equal(report(result, out), 1);
  assert.ok(out.errors.some((e) => e.includes('no source files')));
});

test('report prints one table row per scope with a verdict', () => {
  const out = collector();
  report(evaluate(lcov([
    { file: '/w/rules/a.js', found: 100, hit: 85 },
    { file: '/w/scripts/b.js', found: 100, hit: 82 },
  ])), out);
  const table = out.lines.join('\n');
  assert.match(table, /overall\s+200\s+83\.5%\s+70%\s+pass/);
  assert.match(table, /rules\/\s+100\s+85\.0%\s+80%\s+pass/);
  assert.ok(out.lines.some((l) => l.includes('all thresholds met')));
});
