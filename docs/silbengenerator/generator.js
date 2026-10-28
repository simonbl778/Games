import { SYLLABLES } from './config.js';

const NORMALIZED_SYLLABLES = SYLLABLES.map((syllable) => syllable.toLowerCase());
const MAX_ATTEMPTS = 8;

/** Die gewählte Höchstzahl muss eine ganze Zahl zwischen 1 und 5 sein. */
export function validateMaxSyllables(value) {
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new RangeError('Die maximale Silbenzahl muss eine ganze Zahl von 1 bis 5 sein.');
  }
  return value;
}

/** Ab drei Silben liegt die Untergrenze genau eine Silbe unter der Höchstzahl. */
export function getMinSyllables(maxSyllables) {
  return Math.max(1, validateMaxSyllables(maxSyllables) - 1);
}

function randomIndex(size, random) {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Die Zufallsquelle muss einen Wert von 0 bis kleiner als 1 liefern.');
  }
  return Math.floor(value * size);
}

function makeChain(maxSyllables, random) {
  const minimum = getMinSyllables(maxSyllables);
  const count = minimum + randomIndex(maxSyllables - minimum + 1, random);
  const syllables = Array.from({ length: count }, () => (
    NORMALIZED_SYLLABLES[randomIndex(NORMALIZED_SYLLABLES.length, random)]
  ));
  const lowercaseText = syllables.join('');
  const uppercaseStart = randomIndex(2, random) === 0;
  const text = uppercaseStart
    ? lowercaseText.charAt(0).toUpperCase() + lowercaseText.slice(1)
    : lowercaseText;

  return { text, syllables, count };
}

/**
 * Neue Kette aus max(1, maxSyllables - 1) bis maxSyllables Bausteinen.
 * Länge und Bausteine werden jeweils gleichverteilt gezogen; Wiederholungen
 * innerhalb einer Kette sind erlaubt. Nur der erste Buchstabe der gesamten
 * Kette wird zufällig groß- oder kleingeschrieben.
 *
 * Eine unmittelbar identische Anzeige wird erneut gezogen. Nach acht gleichen
 * Versuchen wechseln wir lediglich die Anfangsschreibung. So endet die Funktion
 * auch mit einer konstanten Zufallsquelle sicher und die Anzeige ändert sich.
 */
export function generateChain(maxSyllables, { random = Math.random, previousText = '' } = {}) {
  validateMaxSyllables(maxSyllables);
  if (typeof random !== 'function') {
    throw new TypeError('Die Zufallsquelle muss eine Funktion sein.');
  }

  let chain;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    chain = makeChain(maxSyllables, random);
    if (chain.text !== previousText) return chain;
  }

  const initial = chain.text.charAt(0);
  const swappedInitial = initial === initial.toUpperCase()
    ? initial.toLowerCase()
    : initial.toUpperCase();
  return { ...chain, text: swappedInitial + chain.text.slice(1) };
}
