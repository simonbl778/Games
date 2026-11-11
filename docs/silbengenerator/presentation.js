import { layoutSchoolChain } from './school-script.js';

let drawingId = 0;
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
    svg.setAttribute('class', 'school-script-svg');
    svg.setAttribute('stroke', 'none');
    svg.setAttribute('viewBox', `${run.left} ${-run.top} ${run.width} ${run.height}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.width = `${run.width / run.unitsPerEm}em`;
    svg.style.height = `${run.height / run.unitsPerEm}em`;
    const title = document.createElementNS(SVG_NAMESPACE, 'title');
    title.textContent = chain.text;
    const guides = document.createElementNS(SVG_NAMESPACE, 'g');
    guides.setAttribute('class', 'school-script-guides');
    for (const height of run.guides) {
      const line = document.createElementNS(SVG_NAMESPACE, 'line');
      line.setAttribute('x1', String(run.left));
      line.setAttribute('x2', String(run.left + run.width));
      line.setAttribute('y1', String(-height));
      line.setAttribute('y2', String(-height));
      line.setAttribute('stroke', 'var(--ink)');
      line.setAttribute('stroke-width', '1');
      line.setAttribute('stroke-opacity', '0.16');
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      guides.append(line);
    }
    const definitions = document.createElementNS(SVG_NAMESPACE, 'defs');
    const runId = ++drawingId;
    let glyphIndex = 0;
    const group = document.createElementNS(SVG_NAMESPACE, 'g');
    group.setAttribute('transform', 'scale(1 -1)');
    for (const glyph of run.glyphs) {
      const addPath = (data, color, character, syllable, part, clip = null) => {
        const path = document.createElementNS(SVG_NAMESPACE, 'path');
        path.setAttribute('d', data);
        path.setAttribute('transform', `translate(${glyph.x} 0)`);
        path.setAttribute('fill', color);
        path.setAttribute('stroke', 'none');
        path.setAttribute('data-character', character);
        path.setAttribute('data-syllable', String(syllable));
        path.setAttribute('data-part', part);
        if (clip) path.setAttribute('clip-path', `url(#${clip})`);
        group.append(path);
      };
      // Preserve the complete contour, then recolor the second half of the shared swing.
      addPath(glyph.path, glyph.color, glyph.character, glyph.syllable, 'letter');
      if (glyph.connection) {
        const connection = glyph.connection;
        let clipId = null;
        if (connection.clipToOwnContour) {
          clipId = `school-join-${runId}-${glyphIndex}`;
          const clip = document.createElementNS(SVG_NAMESPACE, 'clipPath'); clip.setAttribute('id', clipId);
          const contour = document.createElementNS(SVG_NAMESPACE, 'path'); contour.setAttribute('d', glyph.path); contour.setAttribute('fill', '#000');
          clip.append(contour); definitions.append(clip);
        }
        addPath(connection.secondPath, connection.color, connection.character, connection.syllable, 'connection-end', clipId);
      }
      glyphIndex++;
    }
    svg.append(title, guides, group);
    if (run.native) svg.append(definitions);
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
