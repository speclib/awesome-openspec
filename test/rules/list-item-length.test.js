import { test } from 'node:test';
import assert from 'node:assert/strict';
import listItemLength from '../../rules/list-item-length.js';
import { lint } from './helpers.js';

const run = (md) => lint(listItemLength, md);

/** An awesome-list entry line of exactly `n` characters. */
function entry(n) {
  const prefix = '- [x](https://e.com) - ';
  return prefix + 'd'.repeat(n - prefix.length);
}

test('an entry of exactly 150 characters passes', async () => {
  const line = entry(150);
  assert.equal(line.length, 150);
  assert.deepEqual(await run(line), []);
});

test('an entry of 151 characters is reported', async () => {
  const line = entry(151);
  assert.equal(line.length, 151);
  const messages = await run(line);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /List item is 151 characters, exceeds maximum of 150/);
});

test('a short entry passes', async () => {
  assert.deepEqual(await run('- [short](https://e.com) - Fine.'), []);
});

test('list items that do not start with a link are ignored', async () => {
  const long = '- ' + 'd'.repeat(300);
  assert.deepEqual(await run(long), []);
});

test('every over-long entry in a list is reported', async () => {
  const messages = await run([entry(151), entry(160), entry(100)].join('\n'));
  assert.equal(messages.length, 2);
});

test('the reported length is the raw source line, not the rendered text', async () => {
  const line = '- [a very long display name here](https://example.com/some/deep/path/that/is/long) - '
    + 'd'.repeat(80);
  const messages = await run(line);
  assert.equal(messages.length, 1);
  assert.match(messages[0], new RegExp(`is ${line.length} characters`));
});
