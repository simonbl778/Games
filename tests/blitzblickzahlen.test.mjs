import test from 'node:test';
import assert from 'node:assert/strict';
import { DURATIONS, TARGET_SCORE, durationForLevel, cellsForNumber, Session } from '../docs/blitzblickzahlen/game.js';

function correct(session, random = () => .999, responseMs) {
  const number = session.next(random);
  return session.answer(number, { responseMs });
}
function wrong(session, random = () => .999, responseMs) {
  const number = session.next(random);
  return session.answer(number % 10 + 1, { responseMs });
}
function trainedMistake() {
  const session = new Session();
  for (let index = 0; index < 4; index += 1) {
    assert.equal(session.next(() => 0), 1); session.answer(2);
    correct(session);
  }
  return session;
}
function trainedSlowCard() {
  const session = new Session();
  correct(session, () => 0, 1000); // 1 is fast.
  correct(session, () => .999, 4000); // 10 is slower.
  correct(session, () => 0, 1000); // Leave a different card between repeats.
  return session;
}

test('zehn Stufen werden streng schneller: von 5 Sekunden bis 0,3 Sekunden', () => {
  assert.equal(DURATIONS.length, 10);
  assert.equal(durationForLevel(1), 5000);
  assert.equal(durationForLevel(10), 300);
  for (let level = 2; level <= 10; level += 1) assert.ok(durationForLevel(level) < durationForLevel(level - 1));
  for (const level of [0, 11, 1.5, '1', null, NaN]) assert.throws(() => durationForLevel(level), RangeError);
});

test('alle Zahlbilder füllen Zweierreihen von oben links nach unten rechts', () => {
  const expectedRows = [
    [1, 0, 0, 0, 0], [2, 0, 0, 0, 0], [2, 1, 0, 0, 0], [2, 2, 0, 0, 0], [2, 2, 1, 0, 0],
    [2, 2, 2, 0, 0], [2, 2, 2, 1, 0], [2, 2, 2, 2, 0], [2, 2, 2, 2, 1], [2, 2, 2, 2, 2],
  ];
  for (let number = 1; number <= 10; number += 1) {
    const cells = cellsForNumber(number);
    assert.equal(cells.length, 10);
    assert.equal(cells.filter(Boolean).length, number);
    const rows = [0, 2, 4, 6, 8].map(start => cells.slice(start, start + 2).filter(Boolean).length);
    assert.deepEqual(rows, expectedRows[number - 1], `Zahlbild ${number}`);
    if (number % 2 === 1) { assert.equal(cells[number - 1], true); assert.equal(cells[number], false); }
  }
  for (const number of [0, 11, 1.5, '7', NaN]) assert.throws(() => cellsForNumber(number), RangeError);
});

test('alle Zahlen von 1 bis 10 sind anfangs gleich wahrscheinlich, einschließlich der Randwerte', () => {
  for (let number = 1; number <= 10; number += 1) assert.equal(new Session().next(() => (number - .5) / 10), number);
  assert.equal(new Session().next(() => 0), 1);
  assert.equal(new Session().next(() => 1 - Number.EPSILON), 10);
});

test('auch bei konstantem Zufall, Fehlern und hoher Gewichtung folgen nie gleiche Karten direkt aufeinander', () => {
  for (const random of [() => 0, () => 1 - Number.EPSILON, () => .45]) {
    const session = new Session();
    let previous = null;
    for (let index = 0; index < 500; index += 1) {
      const number = session.next(random);
      assert.notEqual(number, previous);
      session.answer(number % 10 + 1, { responseMs: index % 3 ? 1000 : 10000 });
      previous = number;
    }
  }
});

test('nach einem Fehler bleibt die gesuchte Karte für die nächste Aufgabe gesperrt', () => {
  const session = new Session();
  assert.equal(session.next(() => 0), 1);
  session.answer(2, { responseMs: 10000 });
  assert.equal(session.next(() => 0), 2);
  session.answer(2, { responseMs: 500 });
  assert.equal(session.next(() => 0), 1);
});

test('Fehler ziehen höchstens fünf Punkte ab und gewichten die gesuchte Zahl, nicht die angeklickte', () => {
  const session = new Session();
  correct(session, () => 0); correct(session, () => 0);
  const expected = session.next(() => .65);
  const selected = expected === 1 ? 2 : 1;
  const result = session.answer(selected);
  assert.equal(result.correct, false); assert.equal(result.score, 0);
  assert.equal(session.best, 2); assert.equal(session.attempts, 3); assert.equal(session.correct, 2);
  assert.equal(session.weights[expected - 1], 1.5); assert.equal(session.weights[selected - 1], 1);
});

test('oft verwechselte Zahlen erscheinen häufiger, bei reinen Fehlern höchstens dreifach gewichtet', () => {
  assert.equal(trainedMistake().weights[0], 3);
  let ones = 0;
  for (let draw = 0; draw < 1100; draw += 1) if (trainedMistake().next(() => (draw + .5) / 1100) === 1) ones += 1;
  assert.equal(ones, 300); // Weight 3 among eight other eligible cards of weight 1.
});

test('langsam gelöste Karten werden relativ zu anderen Karten häufiger gezogen', () => {
  const session = trainedSlowCard();
  assert.equal(session.averageResponseTimes[0], 1000); assert.equal(session.averageResponseTimes[9], 4000);
  assert.equal(session.weights[0], 1); assert.equal(session.weights[9], 3);
  assert.equal(session.weights[4], 1); // Unseen numbers remain available.
  let tens = 0;
  for (let draw = 0; draw < 1100; draw += 1) if (trainedSlowCard().next(() => (draw + .5) / 1100) === 10) tens += 1;
  assert.equal(tens, 300);
});

test('ohne Vergleichskarte gibt es noch keine Zeitgewichtung', () => {
  const session = new Session(); correct(session, () => 0, 30000);
  assert.deepEqual(session.weights, Array(10).fill(1));
});

test('die letzten fünf Lösungszeiten passen die Häufigkeit an neu gewonnene Sicherheit an', () => {
  const session = trainedSlowCard();
  correct(session, () => .999, 1000);
  assert.ok(session.weights[9] > 1 && session.weights[9] < 3);
  for (let index = 0; index < 4; index += 1) { correct(session, () => 0, 1000); correct(session, () => .999, 1000); }
  assert.equal(session.responseTimes[9].length, 5);
  assert.equal(session.averageResponseTimes[9], 1000); assert.equal(session.weights[9], 1);
});

test('Fehler und lange Zeiten wirken gemeinsam, ohne unbegrenzt hohe Gewichtung', () => {
  const session = new Session();
  for (let index = 0; index < 5; index += 1) { correct(session, () => 0, 1000); wrong(session, () => .999, 1000000); }
  assert.equal(session.weights[9], 5);
  assert.equal(session.averageResponseTimes[9], 30000);
  assert.equal(session.weights[0], 1);
});

test('richtig beantwortete Übungszahlen werden allmählich wieder normal gewichtet', () => {
  const session = new Session(); wrong(session, () => 0); correct(session);
  correct(session, () => 0); assert.equal(session.weights[0], 1.25);
  correct(session); correct(session, () => 0); assert.equal(session.weights[0], 1);
});

test('ein Fehler bei 15 Punkten führt zu 10 Punkten, danach reichen 30 weitere Treffer zum Ziel 40', () => {
  assert.equal(TARGET_SCORE, 40);
  const session = new Session();
  for (let index = 0; index < 15; index += 1) correct(session);
  assert.equal(session.score, 15);
  const result = wrong(session);
  assert.equal(result.score, 10); assert.equal(result.deducted, 5); assert.equal(result.finished, false);
  for (let index = 0; index < 30; index += 1) assert.equal(correct(session).finished, index === 29);
  assert.equal(session.score, 40); assert.equal(session.correct, 45); assert.equal(session.attempts, 46);
  assert.throws(() => session.next(), /Runde/); assert.throws(() => session.answer(10), /Frage/);
});

test('der Punktestand fällt auch bei mehreren Fehlern nie unter null', () => {
  const session = new Session();
  for (let index = 0; index < 3; index += 1) correct(session, () => 0);
  assert.equal(wrong(session, () => 0).deducted, 3); assert.equal(session.score, 0);
  assert.equal(wrong(session, () => 0).deducted, 0); assert.equal(session.score, 0);
});

test('bei 39 Punkten zieht ein Fehler fünf ab und der Sieg folgt erst bei 40', () => {
  const session = new Session();
  for (let index = 0; index < 39; index += 1) correct(session, () => 0);
  assert.equal(session.finished, false); wrong(session, () => 0); assert.equal(session.score, 34);
  for (let index = 0; index < 6; index += 1) assert.equal(correct(session, () => 0).finished, index === 5);
});

test('Doppelklicks, unvollständige Runden und ungültige Antworten verändern den Spielstand nicht', () => {
  const session = new Session(); assert.throws(() => session.answer(1), /Frage/);
  session.next(() => 0); assert.throws(() => session.next(), /Runde/); assert.throws(() => session.answer(0), RangeError);
  session.answer(1, { responseMs: 1000 }); assert.throws(() => session.answer(1, { responseMs: 8000 }), /Frage/);
  assert.equal(session.attempts, 1); assert.equal(session.score, 1); assert.deepEqual(session.responseTimes[0], [1000]);
});

test('ungültige Lösungszeiten werden vor jeder Änderung zurückgewiesen', () => {
  const session = new Session(); session.next(() => 0);
  for (const responseMs of [-1, NaN, Infinity, '1000', null]) assert.throws(() => session.answer(1, { responseMs }), RangeError);
  assert.equal(session.attempts, 0); assert.equal(session.awaitingAnswer, true);
  session.answer(1, { responseMs: 0 }); assert.equal(session.averageResponseTimes[0], 100);
});

test('eine neue Session startet ohne alte Zeiten, Fehler oder Punkte', () => {
  const first = new Session(); wrong(first, () => 0, 10000);
  const second = new Session(); assert.deepEqual(second.weights, Array(10).fill(1));
  assert.deepEqual(second.averageResponseTimes, Array(10).fill(null));
  assert.equal(second.score, 0); assert.equal(second.attempts, 0); assert.equal(second.current, null);
});
