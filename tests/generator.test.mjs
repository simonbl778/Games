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

test('jede gewählte Höchstzahl erlaubt genau die Längen 1 bis zur Höchstzahl', () => {
  for (let maximum = 1; maximum <= 5; maximum += 1) {
    for (let count = 1; count <= maximum; count += 1) {
      const random = sequence((count - 0.5) / maximum, ...Array(count).fill(0), 0.9);
      const chain = generateChain(maximum, { random });
      assert.equal(chain.count, count);
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
