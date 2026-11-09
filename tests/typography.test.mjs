import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeReadingFont, readingHeightFactor, ensureReadingFont } from '../docs/silbengenerator/typography.js';

test('Druckschrift ist der Standard, LA und VA sind getrennte optionale Schriftmodelle', () => {
  for (const value of [undefined, null, '', 'print', 'italic', 'cursive', 'anything']) {
    assert.equal(normalizeReadingFont(value), 'print');
  }
  assert.equal(normalizeReadingFont('la'), 'la');
  assert.equal(normalizeReadingFont('va'), 'va');
});

test('Druckschrift braucht keine Font-Ladefunktion', async () => {
  await ensureReadingFont(undefined, 'print');
  let called = false;
  await ensureReadingFont({ load() { called = true; } }, 'print');
  assert.equal(called, false);
});

for (const [value, family] of [['la', 'SilbenLA'], ['va', 'SilbenVA']]) {
test(`${value}: Schreibschrift wartet auf das jeweils richtige lokale Schriftmodell`, async () => {
  let query;
  let sample;
  await ensureReadingFont({ async load(value, text) {
    query = value;
    sample = text;
    return [{}];
  } }, value);
  assert.equal(query, `400 48px "${family}"`);
  assert.equal(sample, 'AMI OUmimuioua');
});

test(`${value}: fehlende Schreibschrift wird gemeldet statt unbemerkt durch Druckschrift ersetzt`, async () => {
  await assert.rejects(() => ensureReadingFont(undefined, value));
  await assert.rejects(() => ensureReadingFont({ load: async () => [] }, value));
  await assert.rejects(() => ensureReadingFont({ load: async () => { throw new Error('offline'); } }, value));
});
}

test('beide Schulschriften bekommen genug Platz', () => {
  assert.equal(readingHeightFactor('print'), 1.14);
  assert.ok(readingHeightFactor('la') >= 1.2);
  assert.ok(readingHeightFactor('va') >= 1.2);
});
