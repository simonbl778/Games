import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATIONS, TARGET_STREAK, durationForLevel, cellsForNumber, Session } from '../docs/blitzblickzahlen/game.js';

test('zehn Stufen werden streng schneller: von 5 Sekunden bis 0,3 Sekunden', () => {
  assert.equal(DURATIONS.length, 10);
  assert.equal(durationForLevel(1), 5000);
  assert.equal(durationForLevel(10), 300);
  for (let level = 2; level <= 10; level += 1) assert.ok(durationForLevel(level) < durationForLevel(level - 1));
  for (const level of [0, 11, 1.5, '1', null, NaN]) assert.throws(() => durationForLevel(level), RangeError);
});

test('jedes Zahlbild enthält genau die richtige Menge und bewahrt die Fünferstruktur', () => {
  for (let number = 1; number <= 10; number += 1) {
    const cells = cellsForNumber(number);
    assert.equal(cells.length, 10);
    assert.equal(cells.filter(Boolean).length, number);
    assert.deepEqual(cells.slice(0, Math.min(number, 5)), Array(Math.min(number, 5)).fill(true));
  }
  for (const number of [0, 11, 1.5, '7', NaN]) assert.throws(() => cellsForNumber(number), RangeError);
});

test('alle Zahlen von 1 bis 10 sind anfangs gleich wahrscheinlich, einschließlich der Randwerte', () => {
  for (let number = 1; number <= 10; number += 1) {
    assert.equal(new Session().next(() => (number - 0.5) / 10), number);
  }
  assert.equal(new Session().next(() => 0), 1);
  assert.equal(new Session().next(() => 1 - Number.EPSILON), 10);
});

test('Fehler setzen die Serie zurück und gewichten die gesuchte Zahl, nicht die angeklickte', () => {
  const session = new Session();
  session.next(() => 0); session.answer(1);
  session.next(() => 0); session.answer(1);
  session.next(() => .65); const expected = session.current;
  const result = session.answer(expected === 1 ? 2 : 1);
  assert.equal(result.correct, false);
  assert.equal(result.streak, 0);
  assert.equal(session.best, 2);
  assert.equal(session.attempts, 3);
  assert.equal(session.correct, 2);
  assert.equal(session.weights[expected - 1], 1.5);
  assert.equal(session.weights[(expected === 1 ? 2 : 1) - 1], 1);
});

test('eine oft verwechselte Zahl erscheint häufiger, bleibt aber höchstens dreifach gewichtet', () => {
  const session = new Session();
  for (let index = 0; index < 20; index += 1) { session.next(() => 0); session.answer(2); }
  assert.equal(session.weights[0], 3);
  let ones = 0;
  for (let draw = 0; draw < 1200; draw += 1) {
    const choice = session.next(() => (draw + .5) / 1200);
    if (choice === 1) ones += 1;
    session.answer(choice === 1 ? 2 : 1);
    // Restore the trained distribution for exact sampling.
    session.mistakes.fill(0); session.mistakes[0] = 20;
  }
  assert.equal(ones, 300); // 3 / (3 + 9) instead of the initial 10%.
});

test('richtig beantwortete Übungszahlen werden allmählich wieder normal gewichtet', () => {
  const session = new Session();
  session.next(() => 0); session.answer(2);
  session.next(() => 0); session.answer(1);
  assert.equal(session.weights[0], 1.25);
  session.next(() => 0); session.answer(1);
  assert.equal(session.weights[0], 1);
});

test('erst 30 richtige Antworten hintereinander beenden das Spiel', () => {
  const session = new Session();
  for (let index = 0; index < TARGET_STREAK - 1; index += 1) { session.next(() => .99); session.answer(10); }
  assert.equal(session.finished, false);
  session.next(() => .99); session.answer(1);
  assert.equal(session.streak, 0);
  for (let index = 0; index < TARGET_STREAK; index += 1) {
    const number = session.next(() => .99);
    const result = session.answer(number);
    assert.equal(result.finished, index === TARGET_STREAK - 1);
  }
  assert.equal(session.finished, true);
  assert.throws(() => session.next(), /Runde/);
  assert.throws(() => session.answer(10), /Frage/);
});

test('Doppelklicks, unvollständige Runden und ungültige Antworten verändern den Spielstand nicht', () => {
  const session = new Session();
  assert.throws(() => session.answer(1), /Frage/);
  session.next(() => 0);
  assert.throws(() => session.next(), /Runde/);
  assert.throws(() => session.answer(0), RangeError);
  session.answer(1);
  assert.throws(() => session.answer(1), /Frage/);
  assert.equal(session.attempts, 1);
  assert.equal(session.streak, 1);
});

test('eine neue Session startet ohne alte Fehler oder Serien', () => {
  const first = new Session(); first.next(() => 0); first.answer(2);
  const second = new Session();
  assert.deepEqual(second.weights, Array(10).fill(1));
  assert.equal(second.streak, 0);
  assert.equal(second.attempts, 0);
  assert.equal(second.current, null);
});
