import { layoutSchoolChain } from './school-script.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/** Keep the exact text, case, connected forms and ownership of every colored stroke. */
export function renderChain(element, chain, alternateColors = false, readingFont = 'print') {
  const handwriting = readingFont === 'la' || readingFont === 'va';
  element.classList.toggle('school-script-run', handwriting);
  element.classList.toggle('alternating-syllables', alternateColors && !handwriting);
  if (handwriting) {
    const run = layoutSchoolChain(chain, readingFont, alternateColors);
    const document = element.ownerDocument;
    const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.setAttribute('viewBox', `${run.left} ${-run.top} ${run.width} ${run.height}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.width = `${run.width / run.unitsPerEm}em`;
    svg.style.height = `${run.height / run.unitsPerEm}em`;
    const title = document.createElementNS(SVG_NAMESPACE, 'title');
    title.textContent = chain.text;
    const group = document.createElementNS(SVG_NAMESPACE, 'g');
    group.setAttribute('transform', 'scale(1 -1)');
    for (const glyph of run.glyphs) {
      const path = document.createElementNS(SVG_NAMESPACE, 'path');
      path.setAttribute('d', glyph.path);
      path.setAttribute('transform', `translate(${glyph.x} 0)`);
      path.setAttribute('fill', glyph.color);
      path.setAttribute('data-character', glyph.character);
      path.setAttribute('data-syllable', String(glyph.syllable));
      group.append(path);
    }
    svg.append(title, group);
    element.replaceChildren(svg);
    return;
  }
  if (!alternateColors) {
    element.textContent = chain.text;
    return;
  }
  let offset = 0;
  const parts = chain.syllables.map((syllable) => {
    const span = element.ownerDocument.createElement('span');
    span.className = 'chain-syllable';
    span.textContent = chain.text.slice(offset, offset + syllable.length);
    offset += syllable.length;
    return span;
  });
  element.replaceChildren(...parts);
}
