import test from 'node:test';
import assert from 'node:assert/strict';
import { renderChain } from '../docs/silbengenerator/presentation.js';

// Minimal DOM surface: observe the resulting readable text and syllable nodes.
function textElement() {
  const classes = new Set();
  return {
    children: [],
    ownerDocument: { createElement: () => ({ textContent: '', className: '' }) },
    classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
      contains: (name) => classes.has(name) },
    set textContent(value) { this.children = []; this.value = value; },
    get textContent() { return this.children.length ? this.children.map((node) => node.textContent).join('') : this.value; },
    replaceChildren(...children) { this.children = children; this.value = ''; },
  };
}

const chain = { text: 'Momimuio', syllables: ['mo', 'mi', 'mu', 'i', 'o'], count: 5 };

test('ohne Einstellung erscheint die gesamte Kette einfarbig', () => {
  const element = textElement();
  renderChain(element, chain);
  assert.equal(element.textContent, chain.text);
  assert.equal(element.children.length, 0);
  assert.equal(element.classList.contains('alternating-syllables'), false);
});

test('die Farbhilfe trennt echte Silben ohne Leerzeichen oder neue Großbuchstaben', () => {
  const element = textElement();
  renderChain(element, chain, true);
  assert.deepEqual(element.children.map((node) => node.textContent), ['Mo', 'mi', 'mu', 'i', 'o']);
  assert.equal(element.textContent, chain.text);
  assert.equal(element.classList.contains('alternating-syllables'), true);
});

test('nach dem Abschalten verschwindet die Farbhilfe auch für die nächste Kette', () => {
  const element = textElement();
  renderChain(element, chain, true);
  renderChain(element, { text: 'Miu', syllables: ['mi', 'u'], count: 2 }, false);
  assert.equal(element.textContent, 'Miu');
  assert.equal(element.children.length, 0);
  assert.equal(element.classList.contains('alternating-syllables'), false);
});
