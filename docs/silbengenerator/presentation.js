/** Keep the exact text and case while optionally showing the actual syllable boundaries. */
export function renderChain(element, chain, alternateColors = false) {
  element.classList.toggle('alternating-syllables', alternateColors);
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
