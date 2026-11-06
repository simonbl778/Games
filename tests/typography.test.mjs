import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReadingFont, readingHeightFactor, ensureReadingFont } from '../docs/silbengenerator/typography.js';

test('Druckschrift ist der Standard, nur die ausdrückliche Auswahl aktiviert Schreibschrift', () => {
  for (const value of [undefined, null, '', 'print', 'italic', 'anything']) {
    assert.equal(normalizeReadingFont(value), 'print');
  }
  assert.equal(normalizeReadingFont('cursive'), 'cursive');
});

test('Druckschrift braucht keine Font-Ladefunktion', async () => {
  await ensureReadingFont(undefined, 'print');
  let called = false;
  await ensureReadingFont({ load() { called = true; } }, 'print');
  assert.equal(called, false);
});

test('Schreibschrift wartet auf eine tatsächlich geladene lokale Schrift', async () => {
  let query;
  let sample;
  await ensureReadingFont({ async load(value, text) {
    query = value;
    sample = text;
    return [{}];
  } }, 'cursive');
  assert.equal(query, '400 48px "SilbenSchreibschrift"');
  assert.equal(sample, 'Momimuiou');
});

test('fehlende Schreibschrift wird gemeldet statt unbemerkt durch Druckschrift ersetzt', async () => {
  await assert.rejects(() => ensureReadingFont(undefined, 'cursive'));
  await assert.rejects(() => ensureReadingFont({ load: async () => [] }, 'cursive'));
  await assert.rejects(() => ensureReadingFont({ load: async () => { throw new Error('offline'); } }, 'cursive'));
});

test('die großen Ober- und Unterlängen der Schulschrift bekommen genug Platz', () => {
  assert.equal(readingHeightFactor('print'), 1.14);
  assert.ok(readingHeightFactor('cursive') > 1.751);
});
