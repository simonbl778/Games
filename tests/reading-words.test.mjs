import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS, getLevel} from '../docs/silbengenerator/curriculum.js';
import {ReadingGenerator, availableWords, wordInterval} from '../docs/silbengenerator/reading-generator.js';
import {WORDS} from '../docs/silbengenerator/words.js';
import {layoutSchoolChain} from '../docs/silbengenerator/school-script.js';

function randomSource(seed = 37) {
  let state = seed;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}

test('der Wortschatz enthält reale Schreibungen, eindeutige Einträge und vollständige Silben', () => {
  const seen = new Set();
  for (const word of WORDS) {
    assert.match(word.text, /^[A-Za-zÄÖÜäöüß]+$/);
    assert.ok(!seen.has(word.text.toLowerCase()), `Doppelter Eintrag: ${word.text}`);
    seen.add(word.text.toLowerCase());
    assert.equal(word.text, word.syllables.join(''));
    assert.ok(word.count >= 1 && word.count <= 5);
    const learnedCharacters = new Set(LEVELS.find(level => level.number === word.firstLevel).syllables.join(''));
    assert.ok([...word.text.toLowerCase()].every(character => learnedCharacters.has(character)),
      `${word.text} enthält auf seiner Mindeststufe noch unbekannte Buchstaben`);
  }
  for (const [text, parts] of [
    ['Mama', ['Ma', 'ma']], ['Omi', ['O', 'mi']], ['lila', ['li', 'la']],
    ['Material', ['Ma', 'te', 'ri', 'al']], ['Wassermelone', ['Was', 'ser', 'me', 'lo', 'ne']],
    ['Feuerwehrauto', ['Feu', 'er', 'wehr', 'au', 'to']],
  ]) assert.deepEqual(WORDS.find(word => word.text === text)?.syllables, parts);
});

test('Lautverbindungen werden erst auf ihrer eigenen Lernstufe verwendet', () => {
  for (const [before, after, text] of [
    ['a03', 'a04', 'Mama'], ['a15', 'a16', 'Ei'], ['a16', 'a17', 'Kakao'],
    ['b01', 'b02', 'Biene'], ['b02', 'b03', 'Papa'], ['b03', 'b04', 'aß'],
    ['b04', 'b05', 'ich'], ['b06', 'b07', 'Spiele'], ['b07', 'b08', 'Ziege'],
    ['b08', 'b09', 'Mai'], ['b09', 'b10', 'eng'], ['b11', 'b12', 'Eule'],
    ['b13', 'b14', 'Mäuse'], ['b14', 'b15', 'quasi'], ['b16', 'b17', 'Ochse'],
  ]) {
    assert.ok(!availableWords(before).some(word => word.text === text), text);
    assert.ok(availableWords(after).some(word => word.text === text), text);
  }
});

test('in jeder laufenden Vierergruppe steht ab Stufe 4 ein echtes Wort, auch bei maximal fünf Silben', () => {
  for (const level of LEVELS.filter(level => level.number >= 4)) {
    for (let maximum = 1; maximum <= 5; maximum++) {
      const generator = new ReadingGenerator({levelId: level.id, random: randomSource(level.number * 123 + maximum)});
      const displayed = Array.from({length: 120}, () => generator.next(maximum));
      for (let start = 0; start <= displayed.length - 4; start++) {
        assert.ok(displayed.slice(start, start + 4).some(chain => chain.isWord),
          `Stufe ${level.number}, Maximum ${maximum}, Aufgabe ${start + 1}`);
      }
      for (let start = 0; start <= displayed.length - wordInterval(level.id); start++) {
        assert.ok(displayed.slice(start, start + wordInterval(level.id)).some(chain => chain.isWord));
      }
      for (const chain of displayed) {
        assert.ok(chain.count <= maximum);
        assert.ok(!/mm/i.test(chain.text), `${level.id}: ${chain.text}`);
        assert.ok(chain.syllables.every(part => level.syllables.includes(part.toLowerCase())), `${level.id}: ungewählte Silbe in ${chain.text}`);
        assert.equal(chain.text.toLowerCase(), chain.syllables.join('').toLowerCase());
        if (chain.isWord) {
          assert.ok(availableWords(level.id, level.syllables, maximum).some(word => word.text === chain.text));
        } else {
          assert.ok(chain.count >= Math.max(1, maximum - 1));
          assert.ok(chain.syllables.every(part => level.syllables.includes(part)));
        }
      }
    }
  }
});

test('frühe Wörter bleiben kürzer; lange Wörter nutzen ausschließlich tatsächlich gewählte Silben', () => {
  const early = new ReadingGenerator({levelId: 'a04', random: () => 0});
  const chains = Array.from({length: 4}, () => early.next(5));
  assert.ok(chains[3].isWord);
  assert.ok(chains[3].count <= 2);
  assert.ok(!/^(Mama){2,}/.test(chains[3].text));
  for (const id of ['a13', 'b01', 'b12', 'b21']) {
    const generator = new ReadingGenerator({levelId: id, random: () => 0.4});
    const forced = generator.drawWord(5);
    assert.ok(forced.count >= 4 && forced.count <= 5, `${id}: ${forced.text}`);
  }
  const syllables = ['feu', 'er', 'wehr', 'au', 'to'];
  const selected = new ReadingGenerator({levelId: 'b21', syllables, random: () => 0});
  const five = selected.drawWord(5);
  assert.equal(five.text, 'Feuerwehrauto');assert.equal(five.count, 5);
  assert.ok(five.syllables.every(part => syllables.includes(part.toLowerCase())));
});

test('Mumm aus den Screenshots ist weder bei kompletter Stufe 4 noch bei mu allein zulässig', () => {
  assert.ok(!WORDS.some(word => word.text === 'Mumm'));
  assert.deepEqual(availableWords('a04', ['mu'], 1), []);
  assert.throws(() => new ReadingGenerator({levelId: 'a04', syllables: ['mu']}).next(1), /kein passendes echtes Wort/);
  assert.deepEqual(new Set(availableWords('a04', undefined, 1).map(word => word.text)), new Set(['um', 'im', 'am']));
  for (const level of LEVELS) for (const word of availableWords(level.id)) {
    assert.ok(!/mm/i.test(word.text));
    assert.ok(word.syllables.every(part => level.syllables.includes(part.toLowerCase())));
  }
  assert.ok(!availableWords('b21', ['mu', 'um']).some(word => word.text === 'Mumm'));
  assert.ok(!availableWords('a05', ['em', 'ma']).some(word => /mm/i.test(word.text)));
});

test('lange Wörter mit nicht gewählten Endsilben werden nicht eingeschmuggelt', () => {
  assert.ok(!availableWords('a04').some(word => word.text === 'Mumm'));
  assert.ok(!availableWords('a09').some(word => word.text === 'Material'));
  assert.ok(!availableWords('a13').some(word => word.text === 'Wassermelone'));
  const generator = new ReadingGenerator({levelId: 'a13', random: () => 0});
  const first = generator.drawWord(5);assert.equal(first.text, 'Limonade');
  generator.recentWords = [first.text];generator.previousText = 'mamamama';
  const next = generator.drawWord(5);assert.notEqual(next.text, first.text);
  assert.ok(next.syllables.every(part => getLevel('a13').syllables.includes(part.toLowerCase())));
});

test('Nomen und Namen bleiben groß, Verben und Adjektive klein, auch bei Zufallstreffern', () => {
  const mama = new ReadingGenerator({levelId: 'a04', syllables: ['ma'], random: () => 0.8});
  const word = mama.next(2);
  assert.equal(word.text, 'Mama');
  assert.equal(word.isWord, true);
  const next = mama.next(2);
  assert.notEqual(next.text, word.text);
  assert.notEqual(next.text, 'mama');
  assert.equal(next.count, 1);
  const lila = new ReadingGenerator({levelId: 'a07', syllables: ['li', 'la'], random: randomSource()});
  const readings = Array.from({length: 60}, () => lila.next(2));
  assert.ok(readings.some(chain => chain.text === 'lila' && chain.isWord));
  for (const chain of readings.filter(chain => chain.isWord)) {
    assert.equal(chain.text, WORDS.find(w => w.text.toLowerCase() === chain.text.toLowerCase()).text);
  }
});

test('eigene Silbenauswahl fügt weder unbekannte Silben noch abgewählte Lautverbindungen hinzu', () => {
  assert.ok(availableWords('a04', ['ma']).some(word => word.text === 'Mama'));
  assert.ok(!availableWords('a04', ['ma']).some(word => word.text === 'Omi'));
  assert.deepEqual(availableWords('a04', ['i']), []);
  assert.throws(() => new ReadingGenerator({levelId: 'a04', syllables: ['i']}).next(5), /kein passendes echtes Wort/);
  assert.throws(() => new ReadingGenerator({levelId: 'a04', syllables: ['ma']}).next(1), /kein passendes echtes Wort/);
  const withoutNg = getLevel('b10').syllables.filter(part => !part.includes('ng') && !part.includes('nk'));
  assert.ok(!availableWords('b10', withoutNg).some(word => ['danke', 'Bank', 'singen'].includes(word.text)));
  const generator = new ReadingGenerator({levelId: 'a04', syllables: ['ma'], random: randomSource()});
  for (const chain of Array.from({length: 50}, () => generator.next(5))) {
    assert.ok(chain.isWord ? chain.text === 'Mama' : chain.syllables.every(part => part === 'ma'));
  }
});

test('neue Sitzungen setzen die Wortfolge zurück; konstante Zufallsquellen enden und Schreibweisen bleiben korrekt', () => {
  for (const random of [() => 0, () => 0.99999]) {
    for (const level of ['a04', 'a10', 'b21']) {
      const generator = new ReadingGenerator({levelId: level, random});
      const words = Array.from({length: 24}, () => generator.next(5));
      assert.ok(words.slice(0, 4).some(word => word.isWord));
      const restart = new ReadingGenerator({levelId: level, random});
      assert.equal(restart.sinceWord, 0);
      assert.equal(restart.previousText, '');
    }
  }
  for (const random of [() => 1, () => -1, () => NaN, () => '0.5']) {
    assert.throws(() => new ReadingGenerator({levelId: 'a04', random}).drawWord(5), RangeError);
  }
});

test('alle echten Wörter bleiben in beiden Schreibschriften vollständig und richtig eingefärbt', () => {
  for (const model of ['la', 'va']) {
    for (const word of WORDS) {
      const run = layoutSchoolChain(word, model, true);
      assert.equal(run.glyphs.map(glyph => glyph.character).join(''), word.text);
      const letters = run.glyphs.flatMap(glyph => [...glyph.character].map(character => ({character, syllable: glyph.syllable})));
      const boundaries = word.syllables.map(part => part.length);
      let offset = 0;
      for (let index = 0; index < boundaries.length; index++) {
        for (const glyph of letters.slice(offset, offset + boundaries[index])) assert.equal(glyph.syllable, index);
        offset += boundaries[index];
      }
      assert.ok(run.width > 0 && Number.isFinite(run.width));
    }
  }
});
