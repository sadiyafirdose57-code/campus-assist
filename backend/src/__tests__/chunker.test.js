import test from 'node:test';
import assert from 'node:assert/strict';
import { chunkText } from '../services/chunker.js';
import { extractiveAnswer } from '../services/fallback.js';

test('empty text gives no chunks', () => {
  assert.deepEqual(chunkText('   \n\n  '), []);
});

test('short text stays in one chunk', () => {
  assert.equal(chunkText('Attendance must be 75%.').length, 1);
});

test('long text is split and every chunk respects the size limit (plus overlap)', () => {
  const para = 'Students must submit the form to the office. ';
  const text = Array.from({ length: 60 }, () => para.repeat(3)).join('\n\n');
  const chunks = chunkText(text, { size: 600, overlap: 100 });
  assert.ok(chunks.length > 5);
  for (const c of chunks) assert.ok(c.length <= 600 + 100 + 2, `chunk too long: ${c.length}`);
});

test('a single huge paragraph is hard-split', () => {
  const chunks = chunkText('word '.repeat(1000), { size: 500, overlap: 50 });
  assert.ok(chunks.length >= 9);
});

test('extractive fallback handles no results and some results', () => {
  assert.match(extractiveAnswer([]), /couldn't find/i);
  assert.match(extractiveAnswer([{ title: 'Fees', text: 'Pay online.' }]), /Pay online/);
});
