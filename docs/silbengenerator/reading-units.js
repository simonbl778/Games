// Mehrbuchstabige Lautverbindungen werden als eigene Lerninhalte behandelt.
const GROUPS = ['sch', 'chs', 'ei', 'ie', 'ai', 'au', 'eu', 'äu', 'ch', 'ck', 'pf', 'qu', 'ng', 'nk', 'tz'];

export function readingUnits(part) {
  const text = part.toLowerCase();
  const found = [];
  for (let i = 0; i < text.length;) {
    // ist = i+s+t; am Silbenanfang sind st/sp eigene spätere Lerninhalte.
    const unit = i === 0 && /^(st|sp)/.test(text)
      ? text.slice(0, 2)
      : GROUPS.find(group => text.startsWith(group, i)) || text[i];
    found.push(unit);
    i += unit.length;
  }
  return found;
}

export function hasLearnedUnits(word, learned) {
  return word.syllables.every(part => readingUnits(part).every(unit => learned.has(unit))) &&
    // Diese Lautverbindungen können auch über geschriebene Silbengrenzen reichen.
    ['ng', 'nk', 'chs'].every(group => !word.text.toLowerCase().includes(group) || learned.has(group));
}
