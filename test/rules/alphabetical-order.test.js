import { test } from 'node:test';
import assert from 'node:assert/strict';
import alphabeticalOrder from '../../rules/alphabetical-order.js';
import { lint } from './helpers.js';

const run = (md) => lint(alphabeticalOrder, md);

test('an ordered list passes', async () => {
  assert.deepEqual(await run(`
- [alpha](https://example.com/a) - First.
- [beta](https://example.com/b) - Second.
- [gamma](https://example.com/c) - Third.
`), []);
});

test('an out-of-order entry is reported', async () => {
  const messages = await run(`
- [alpha](https://example.com/a) - First.
- [zulu](https://example.com/z) - Last.
- [beta](https://example.com/b) - Second.
`);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /"beta" should be before "zulu"/);
});

test('comparison is case-insensitive', async () => {
  assert.deepEqual(await run(`
- [alpha](https://example.com/a) - One.
- [Beta](https://example.com/b) - Two.
- [gamma](https://example.com/c) - Three.
`), []);
});

test('a table-of-contents list of anchors is skipped', async () => {
  assert.deepEqual(await run(`
- [Zebra](#zebra)
- [Apple](#apple)
`), []);
});

test('a list with fewer than two links is skipped', async () => {
  assert.deepEqual(await run(`
- [only](https://example.com/only) - Alone.
- plain text item
`), []);
});

test('items that do not start with a link are ignored', async () => {
  assert.deepEqual(await run(`
- plain text first
- [alpha](https://example.com/a) - One.
- [beta](https://example.com/b) - Two.
`), []);
});

test('each list is ordered independently, so subsections do not clash', async () => {
  assert.deepEqual(await run(`
### Web & Desktop

- [Specboard](https://example.com/s) - One.
- [Spek](https://example.com/k) - Two.

### Terminal

- [dossier](https://example.com/d) - Three.
- [specgetty](https://example.com/g) - Four.
`), []);
});

test('multiple violations in one list are all reported', async () => {
  const messages = await run(`
- [delta](https://example.com/d) - One.
- [charlie](https://example.com/c) - Two.
- [bravo](https://example.com/b) - Three.
`);
  assert.equal(messages.length, 2);
});
