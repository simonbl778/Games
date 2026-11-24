import {getLevel} from './curriculum.js';
import {generateChain, getMinSyllables, validateMaxSyllables} from './generator.js';
import {WORDS} from './words.js';
import {readingUnits, hasLearnedUnits} from './reading-units.js';

/** A fixed upper gap, rather than a chance of drawing a word. */
export function wordInterval(levelId) {
  const number = getLevel(levelId).number;
  return number >= 20 ? 2 : number >= 10 ? 3 : number >= 4 ? 4 : 0;
}

/** Respect both the workbook stage and a parent's reduced syllable selection. */
export function availableWords(levelId, selected = getLevel(levelId).syllables, maximum = 5) {
  validateMaxSyllables(maximum);
  const level = getLevel(levelId);
  const selectedSet = new Set(selected.map(s => s.toLowerCase()));
  const activeUnits = new Set([...selectedSet].flatMap(readingUnits));
  return WORDS.filter(word => word.firstLevel <= (level.number || 4) && word.count <= maximum && !/mm/i.test(word.text) &&
    hasLearnedUnits(word, activeUnits) &&
    // Complete selection is not permission to invent codas or other syllables.
    // Every real, correctly separated word syllable must be explicitly selected.
    word.syllables.every(syllable => selectedSet.has(syllable.toLowerCase()))
  );
}

function drawIndex(size, random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Die Zufallsquelle muss einen Wert von 0 bis kleiner als 1 liefern.');
  }
  return Math.floor(value * size);
}

/** One instance per practice session; neither taps nor word spelling alter the quota. */
export class ReadingGenerator {
  constructor({levelId = 'previous', syllables = getLevel(levelId).syllables, random = Math.random} = {}) {
    if (typeof random !== 'function') throw new TypeError('Die Zufallsquelle muss eine Funktion sein.');
    this.syllables = [...syllables];
    this.words = availableWords(levelId, syllables);
    this.byText = new Map(this.words.map(word => [word.text.toLowerCase(), word]));
    this.interval = wordInterval(levelId);
    this.random = random;
    this.previousText = '';
    this.sinceWord = 0;
    this.recentWords = [];
  }

  asWord(word) {
    // Never randomly alter the capitalization of nouns, names, verbs or adjectives.
    return {text: word.text, syllables: [...word.syllables], count: word.count, isWord: true};
  }

  drawWord(maximum) {
    const allowed = this.words.filter(word => word.count <= maximum);
    if (!allowed.length) throw new RangeError('Für diese Auswahl gibt es noch kein passendes echtes Wort.');
    const nonRepeating = allowed.filter(word => word.text !== this.previousText);
    const eligible = nonRepeating.length ? nonRepeating : allowed;
    const matchingLength = eligible.filter(word => word.count >= getMinSyllables(maximum));
    const freshLong = matchingLength.filter(word => !this.recentWords.includes(word.text));
    const fresh = eligible.filter(word => !this.recentWords.includes(word.text));
    // A lone long word must not monopolize every word task. A shorter selected
    // word is preferable to repeating it throughout the session.
    const pool = freshLong.length ? freshLong : fresh.length ? fresh : matchingLength.length ? matchingLength : eligible;
    return this.asWord(pool[drawIndex(pool.length, this.random)]);
  }

  next(maximum) {
    validateMaxSyllables(maximum);
    // Reject impossible custom choices before showing exercises, rather than quietly
    // dropping the word guarantee or adding unknown syllables.
    if (this.interval && !this.words.some(word => word.count <= maximum)) {
      throw new RangeError('Für diese Auswahl gibt es noch kein passendes echtes Wort.');
    }
    let chain;
    if (this.interval && this.sinceWord >= this.interval - 1) {
      chain = this.drawWord(maximum);
    } else {
      chain = generateChain(maximum, {random: this.random, previousText: this.previousText, syllables: this.syllables});
      const known = this.byText.get(chain.text.toLowerCase());
      if (known && known.count <= maximum) chain = this.asWord(known);
      else chain = {...chain, isWord: false};
      if (chain.isWord && chain.text === this.previousText) {
        if (this.words.some(word => word.count <= maximum && word.text !== chain.text)) chain = this.drawWord(maximum);
        else {
          // For ma alone, a chance hit on Mama must not become mama or repeat Mama.
          // Choose a different permitted practice chain with bounded work.
          search: for (let count = getMinSyllables(maximum); count <= maximum; count++) {
            for (const part of this.syllables) {
              const text = part.repeat(count);
              if (!/mm/i.test(text) && text.toLowerCase() !== this.previousText.toLowerCase() && !this.byText.has(text.toLowerCase())) {
                chain = {text, syllables: Array(count).fill(part), count, isWord: false};
                break search;
              }
            }
          }
        }
      }
    }
    if (chain.isWord) {
      this.sinceWord = 0;
      this.recentWords = [...this.recentWords.filter(text => text !== chain.text), chain.text].slice(-8);
    } else this.sinceWord += 1;
    this.previousText = chain.text;
    return chain;
  }
}
