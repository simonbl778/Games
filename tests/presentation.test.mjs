import test from 'node:test';
import assert from 'node:assert/strict';
import { renderChain } from '../docs/silbengenerator/presentation.js';
import { layoutSchoolChain } from '../docs/silbengenerator/school-script.js';

function textElement() {
  const classes = new Set();
  const element = {
    children: [], attributes: {}, style: {},
    classList: { toggle: (name, on) => on ? classes.add(name) : classes.delete(name), contains: (name) => classes.has(name) },
    setAttribute(name, value) { this.attributes[name] = value; },
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; this.value = ''; },
    set textContent(value) { this.children = []; this.value = value; },
    get textContent() { return this.children.length ? this.children.map((node) => node.textContent).join('') : (this.value || ''); },
  };
  element.ownerDocument = { createElement: textElement, createElementNS: (namespace, tag) => Object.assign(textElement(), { tag, namespace }) };
  return element;
}
const chain = { text: 'Momimuio', syllables: ['mo', 'mi', 'mu', 'i', 'o'], count: 5 };

test('Druckschrift erhält echte Silbenfarben ohne Abstände oder neue Großbuchstaben', () => {
  const element = textElement();
  renderChain(element, chain, true);
  assert.deepEqual(element.children.map((node) => node.textContent), ['Mo', 'mi', 'mu', 'i', 'o']);
  assert.equal(element.textContent, chain.text);
  assert.ok(element.classList.contains('alternating-syllables'));
  renderChain(element, chain, false);
  assert.equal(element.textContent, chain.text);
  assert.equal(element.children.length, 0);
  assert.equal(element.classList.contains('alternating-syllables'), false);
});

for (const model of ['la', 'va']) {
  test(`${model}: jeder vollständige Buchstabe gehört zur richtigen Silbe, auch bei Überhängen`, () => {
    const run = layoutSchoolChain(chain, model, true);
    assert.equal(run.glyphs.map((glyph) => glyph.character).join(''), chain.text);
    assert.deepEqual(run.glyphs.map((glyph) => glyph.syllable), [0, 0, 1, 1, 2, 2, 3, 4]);
    assert.deepEqual(run.glyphs.map((glyph) => glyph.color), ['var(--ink)', 'var(--ink)', 'var(--syllable-alt)', 'var(--syllable-alt)', 'var(--ink)', 'var(--ink)', 'var(--syllable-alt)', 'var(--ink)']);
    assert.ok(run.glyphs.some((glyph) => glyph.bounds[2] > glyph.advance), 'Probe enthält einen echten kursiven Überhang');
    for (const glyph of run.glyphs) {
      assert.ok(glyph.path.length > 0);
      assert.ok(glyph.x + glyph.bounds[0] >= run.left);
      assert.ok(glyph.x + glyph.bounds[2] <= run.left + run.width);
    }
  });

  test(`${model}: Farbe ändert keine Form, Position oder Verbindung`, () => {
    const plain = layoutSchoolChain(chain, model, false);
    const colored = layoutSchoolChain(chain, model, true);
    assert.deepEqual(plain.glyphs.map(({ color, ...shape }) => shape), colored.glyphs.map(({ color, ...shape }) => shape));
    assert.ok(plain.glyphs.every((glyph) => glyph.color === 'var(--ink)'));
  });

  test(`${model}: die tatsächlichen Konturen werden vollständig gefärbt, ohne Farbverlauf oder Silben-Clipping`, () => {
    const element = textElement();
    renderChain(element, chain, true, model);
    assert.equal(element.textContent, chain.text);
    const svg = element.children[0];
    assert.equal(svg.tag, 'svg');
    assert.equal(svg.attributes.stroke, 'none');
    const paths = svg.children[1].children;
    const run = layoutSchoolChain(chain, model, true);
    assert.equal(paths.length, chain.text.length);
    paths.forEach((path, index) => {
      assert.equal(path.tag, 'path');
      assert.equal(path.attributes.d, run.glyphs[index].path);
      assert.equal(path.attributes.fill, run.glyphs[index].color);
      assert.equal(path.attributes.stroke, 'none');
      assert.equal(path.attributes.transform, `translate(${run.glyphs[index].x} 0)`);
      assert.equal(path.attributes['clip-path'], undefined);
      assert.equal(path.attributes.mask, undefined);
    });
    renderChain(element, chain, false, model);
    assert.ok(element.children[0].children[1].children.every((path) => path.attributes.fill === 'var(--ink)'));
    renderChain(element, chain, false, 'print');
    assert.equal(element.classList.contains('school-script-run'), false);
    assert.equal(element.children.length, 0);
  });
}

test('das innere LA-m verwendet den anschließenden Bogen statt des einzelnen Anfangshakens', () => {
  const run = layoutSchoolChain({ text: 'mimu', syllables: ['mi', 'mu'] }, 'la', true);
  assert.equal(run.glyphs[0].name, 'm.to.i');
  assert.equal(run.glyphs[2].name, 'm.med.to.u');
  assert.equal(run.glyphs[2].color, 'var(--syllable-alt)');
});

test('falsche Silbengrenzen oder nicht verfügbare Buchstaben werden nicht stillschweigend eingefärbt', () => {
  assert.throws(() => layoutSchoolChain({ text: 'mimu', syllables: ['mo', 'mu'] }, 'la'));
  assert.throws(() => layoutSchoolChain({ text: 'ma', syllables: ['ma'] }, 'va'));
});
