import test from 'node:test';
import assert from 'node:assert/strict';
import { SYLLABLES, DEFAULT_MAX_SYLLABLES } from '../docs/silbengenerator/config.js';
import { generateChain, validateMaxSyllables } from '../docs/silbengenerator/generator.js';

function sequence(...values) {
  let index = 0;
  return () => {
    assert.ok(index < values.length, 'Die vorbereitete Zufallsfolge ist aufgebraucht.');
    return values[index++];
  };
}

test('die konfigurierbaren Bausteine entsprechen der Vorgabe', () => {
  assert.deepEqual(SYLLABLES, ['Mo', 'Mi', 'Mu', 'i', 'o', 'u']);
  assert.ok(Object.isFrozen(SYLLABLES));
  assert.equal(validateMaxSyllables(DEFAULT_MAX_SYLLABLES), DEFAULT_MAX_SYLLABLES);
});

test('jede Höchstzahl hält ihre erlaubte Unter- und Obergrenze ein', () => {
  const ranges = [[1, 1, 1], [2, 1, 2], [3, 2, 3], [4, 3, 4], [5, 4, 5]];
  for (const [maximum, minimum, upper] of ranges) {
    for (const [draw, count] of [[0, minimum], [0.499999, minimum], [0.5, upper], [1 - Number.EPSILON, upper]]) {
      const chain = generateChain(maximum, {
        random: sequence(draw, ...Array(count).fill(0), 0.9),
      });
      assert.equal(chain.count, count, `Höchstzahl ${maximum}, Zufallswert ${draw}`);
      assert.equal(chain.syllables.length, count);
      assert.equal(chain.text, 'mo'.repeat(count));
    }
  }
});

test('einzelne Vokale zählen jeweils als eine Silbe', () => {
  const chain = generateChain(3, { random: sequence(0.99, 0.5, 0.7, 0.99, 0.99) });
  assert.deepEqual(chain, { text: 'iou', syllables: ['i', 'o', 'u'], count: 3 });
});

test('alle sechs verfügbaren Bausteine können ausgewählt werden', () => {
  for (let index = 0; index < SYLLABLES.length; index += 1) {
    const chain = generateChain(1, { random: sequence(0.5, (index + 0.5) / 6, 0.99) });
    assert.equal(chain.text, SYLLABLES[index].toLowerCase());
    assert.equal(chain.count, 1);
  }
});

test('nur der allererste Buchstabe kann groß sein, weitere Silben bleiben klein', () => {
  const randomValues = [0.99, 0, 0.2, 0.4, 0.5, 0.7];
  const uppercase = generateChain(5, { random: sequence(...randomValues, 0.1) });
  const lowercase = generateChain(5, { random: sequence(...randomValues, 0.9) });
  assert.deepEqual(uppercase.syllables, ['mo', 'mi', 'mu', 'i', 'o']);
  assert.equal(uppercase.text, 'Momimuio');
  assert.equal(lowercase.text, 'momimuio');
  assert.equal(uppercase.text.slice(1), uppercase.text.slice(1).toLowerCase());
});

test('Bausteine dürfen innerhalb einer Kette mehrfach vorkommen', () => {
  const chain = generateChain(5, { random: sequence(0.99, 0, 0, 0, 0, 0, 0.1) });
  assert.equal(chain.text, 'Momomomomo');
  assert.equal(chain.count, 5);
});

test('gleiche Vokale werden auch hinter Mo, Mi und Mu normalerweise vermieden', () => {
  const normalized = SYLLABLES.map((part) => part.toLowerCase());
  for (const first of normalized) {
    const vowel = first.slice(-1);
    const chain = generateChain(3, {
      random: sequence(0, (normalized.indexOf(first) + 0.5) / 6,
        (normalized.indexOf(vowel) + 0.5) / 6, 0.5, 0, 0.9),
    });
    assert.equal(chain.text, first + 'mo');
    assert.equal(chain.count, 2);
    assert.ok(!/(ii|oo|uu)/i.test(chain.text));
  }
});

test('eine doppelte Vokalgrenze bleibt als seltene Ausnahme möglich', () => {
  const chain = generateChain(3, { random: sequence(0, 0.1, 0.75, 0, 0.1) });
  assert.equal(chain.text, 'Moo');
  assert.deepEqual(chain.syllables, ['mo', 'o']);
});

test('über viele Ketten bleiben gleiche Vokalgrenzen weit unter einem Prozent', () => {
  let state = 0x12345678;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
  let repeated = 0;
  let boundaries = 0;
  for (let index = 0; index < 30000; index += 1) {
    const chain = generateChain(5, { random });
    for (let part = 1; part < chain.syllables.length; part += 1) {
      boundaries += 1;
      if (chain.syllables[part - 1].slice(-1) === chain.syllables[part][0]) repeated += 1;
    }
  }
  assert.ok(repeated > 0, 'Die seltene Ausnahme darf weiterhin vorkommen.');
  assert.ok(repeated / boundaries < 0.005, `Anteil doppelter Vokale: ${repeated / boundaries}`);
});

test('die Vermeidung gleicher Vokale endet auch mit konstantem Zufall', () => {
  let calls = 0;
  const chain = generateChain(3, { random: () => {
    assert.ok(++calls < 20);
    return 0.7;
  } });
  assert.equal(chain.count, 3);
  assert.ok(!/(ii|oo|uu)/i.test(chain.text));
});

test('eine identische vorherige Anzeige wird erneut gezogen', () => {
  const chain = generateChain(1, {
    previousText: 'mo',
    random: sequence(0, 0, 0.9, 0, 0.2, 0.9),
  });
  assert.deepEqual(chain, { text: 'mi', syllables: ['mi'], count: 1 });
});

test('eine konstante Zufallsquelle führt zu keiner Endlosschleife', () => {
  let calls = 0;
  const chain = generateChain(1, {
    previousText: 'Mo',
    random: () => {
      calls += 1;
      assert.ok(calls <= 30, 'Der Wiederholungsversuch muss begrenzt sein.');
      return 0;
    },
  });
  assert.deepEqual(chain, { text: 'mo', syllables: ['mo'], count: 1 });
  assert.equal(calls, 24);
});

test('ungültige Höchstzahlen werden zurückgewiesen', () => {
  for (const value of [0, 6, -1, 1.5, NaN, Infinity, '3', undefined, null]) {
    assert.throws(() => generateChain(value), RangeError);
  }
});

test('ungültige Zufallsquellen werden zurückgewiesen', () => {
  assert.throws(() => generateChain(1, { random: 0.5 }), TypeError);
  for (const value of [-0.01, 1, Infinity, NaN, '0.5']) {
    assert.throws(() => generateChain(1, { random: () => value }), RangeError);
  }
});
