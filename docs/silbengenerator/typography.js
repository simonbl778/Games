export const PRINT_FONT = 'FibelNord';
export const SCHOOL_FONTS = { la: 'SilbenLA', va: 'SilbenVA' };

export function normalizeReadingFont(value) {
  return value === 'la' || value === 'va' ? value : 'print';
}

export function readingHeightFactor(value) {
  // Both local school fonts reserve room for capital letters, dots and joins.
  return normalizeReadingFont(value) === 'print' ? 1.14 : 1.2;
}

export async function ensureReadingFont(fonts, value) {
  const model = normalizeReadingFont(value);
  const family = model === 'print' ? PRINT_FONT : SCHOOL_FONTS[model];
  if (!fonts || typeof fonts.load !== 'function') {
    throw new Error('Reading font could not be loaded.');
  }
  const faces = await fonts.load('400 48px "' + family + '"', model === 'print' ? 'ma Ma a A mo Mi Mu ÄÖÜäöüß' : 'AMI OUmimuioua');
  if (!faces.length) throw new Error('Reading font could not be loaded.');
}
