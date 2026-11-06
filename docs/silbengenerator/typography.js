export const CURSIVE_FONT = 'SilbenSchreibschrift';

export function normalizeReadingFont(value) {
  return value === 'cursive' ? 'cursive' : 'print';
}

export function readingHeightFactor(value) {
  // The bundled VA font spans 0.991 em plus 0.018 em line gap.
  return normalizeReadingFont(value) === 'cursive' ? 1.12 : 1.14;
}

export async function ensureReadingFont(fonts, value) {
  if (normalizeReadingFont(value) !== 'cursive') return;
  if (!fonts || typeof fonts.load !== 'function') {
    throw new Error('School handwriting could not be loaded.');
  }
  const faces = await fonts.load('400 48px "' + CURSIVE_FONT + '"', 'Momimuiou');
  if (!faces.length) throw new Error('School handwriting could not be loaded.');
}
