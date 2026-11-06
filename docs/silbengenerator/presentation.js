const connectedColorChains = new WeakMap();

/** Keep the exact text and case while optionally showing the actual syllable boundaries. */
export function renderChain(element, chain, alternateColors = false, connected = false) {
  connectedColorChains.delete(element);
  element.classList.toggle('connected-syllable-colors', false);
  element.style?.removeProperty('background-image');
  element.classList.toggle('alternating-syllables', alternateColors && !connected);
  if (!alternateColors || connected) {
    element.textContent = chain.text;
    if (alternateColors && connected) connectedColorChains.set(element, chain);
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

/** Paint continuous handwriting without splitting its shaping run into spans. */
export function refreshSyllableColors(element) {
  const chain = connectedColorChains.get(element);
  const node = element.firstChild;
  const document = element.ownerDocument;
  if (!chain || !node || typeof document.createRange !== 'function') return;
  const bounds = element.getBoundingClientRect();
  if (bounds.width <= 0) return;
  const range = document.createRange();
  const stops = [];
  let offset = 0;
  let boundary = 0;
  try {
    range.setStart(node, 0);
    chain.syllables.forEach((syllable, index) => {
      offset += syllable.length;
      range.setEnd(node, offset);
      const end = Math.max(boundary, Math.min(bounds.width, range.getBoundingClientRect().right - bounds.left));
      const color = index % 2 ? 'var(--syllable-alt)' : 'var(--ink)';
      stops.push(color + ' ' + boundary + 'px', color + ' ' + end + 'px');
      boundary = end;
    });
    const last = (chain.syllables.length - 1) % 2 ? 'var(--syllable-alt)' : 'var(--ink)';
    stops.push(last + ' 100%');
    element.style.backgroundImage = 'linear-gradient(to right, ' + stops.join(', ') + ')';
    element.classList.toggle('connected-syllable-colors', true);
  } finally {
    range.detach?.();
  }
}
