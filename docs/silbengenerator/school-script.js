import { SCHOOL_OUTLINES } from './fonts/school-outlines.js';

/** Shape the exact local school-font forms while retaining each character's syllable. */
export function layoutSchoolChain(chain, model, alternateColors = false) {
  const font = SCHOOL_OUTLINES[model];
  if (!font) throw new Error('Unknown school handwriting model.');
  if (chain.syllables.join('').toLowerCase() !== chain.text.toLowerCase()) {
    throw new Error('Syllables do not match the displayed chain.');
  }
  const syllables = chain.syllables.flatMap((part, index) => [...part].map(() => index));
  let advance = 0;
  let left = 0;
  let right = 0;
  const colorFor = (syllable) => alternateColors && syllable % 2 ? 'var(--syllable-alt)' : 'var(--ink)';
  const glyphs = [...chain.text].map((character, index, characters) => {
    const base = index === 0 ? (font.initial[character] || character) : (font.medial[character] || character);
    const next = characters[index + 1];
    const name = next ? font.joining[base]?.[next] : (font.final[base] || base);
    const outline = font.glyphs[name];
    if (!outline) throw new Error('Missing school handwriting form.');
    const syllable = syllables[index];
    const glyph = { character, name, syllable, path: outline.path, x: advance,
      bounds: outline.bounds, advance: outline.advance,
      color: colorFor(syllable),
      connection: outline.connection ? { ...outline.connection, character: next,
        syllable: syllables[index + 1], color: colorFor(syllables[index + 1]) } : null };
    left = Math.min(left, advance + outline.bounds[0]);
    right = Math.max(right, advance + outline.bounds[2]);
    advance += outline.advance;
    return glyph;
  });
  // Include italic overhangs. Only the shared swing changes color, never a band across letters.
  left -= 20;
  right = Math.max(right, advance) + 20;
  return { glyphs, left, width: right - left, height: font.height, top: font.top,
    unitsPerEm: font.unitsPerEm, guides: font.guides };
}
