#!/usr/bin/env python3
"""Check school-font coverage and actual continuous joins, including initial capitals.

Requires the development dependencies in assets/school-fonts/requirements.txt.
No Android device or browser is needed for these font-specific checks.
"""
from pathlib import Path
import itertools
import json
import subprocess
from fontTools.pens.svgPathPen import SVGPathPen
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import label
from fontTools.ttLib import TTFont
import uharfbuzz as hb

ROOT = Path(__file__).resolve().parent.parent
source = (ROOT / 'docs/silbengenerator/fonts/school-outlines.js').read_text()
outlines = json.loads(source.split('export const SCHOOL_OUTLINES = ', 1)[1].strip().removesuffix(';'))
for model in ('LA', 'VA'):
    path = ROOT / 'docs/silbengenerator/fonts' / f'Silben{model}.ttf'
    font = TTFont(path)
    assert all(ord(char) in font.getBestCmap() for char in 'IMOUimou ')
    glyph_set = font.getGlyphSet()
    for name, outline in outlines[model.lower()]['glyphs'].items():
        pen = SVGPathPen(glyph_set)
        glyph_set[name].draw(pen)
        assert pen.getCommands() == outline['path'], (model, name, 'vector contour differs from font')
        assert font['hmtx'][name][0] == outline['advance'], (model, name, 'advance differs from font')
    expected = []
    shaper = hb.Font(hb.Face(path.read_bytes()))
    for length in range(1, 6):
        for parts in itertools.product(('mo', 'mi', 'mu', 'i', 'o', 'u'), repeat=length):
            lower = ''.join(parts)
            for text in (lower, lower.capitalize()):
                buffer = hb.Buffer()
                buffer.add_str(text)
                buffer.guess_segment_properties()
                hb.shape(shaper, buffer, {'calt': True})
                assert all(glyph.codepoint for glyph in buffer.glyph_infos), text
                assert sum(position.x_advance for position in buffer.glyph_positions) > 0, text
                expected.append((text, [font.getGlyphName(g.codepoint) for g in buffer.glyph_infos],
                                 [p.x_advance for p in buffer.glyph_positions]))
    renderer = subprocess.run(['node', '--input-type=module', '-e', """
import { layoutSchoolChain } from './docs/silbengenerator/school-script.js';
import { readFileSync } from 'node:fs';
const { model, texts } = JSON.parse(readFileSync(0, 'utf8'));
process.stdout.write(JSON.stringify(texts.map(text => {
  const run = layoutSchoolChain({ text, syllables: [text] }, model);
  return [run.glyphs.map(g => g.name), run.glyphs.map(g => g.advance)];
})));
"""], cwd=ROOT, input=json.dumps({'model': model.lower(), 'texts': [e[0] for e in expected]}),
        text=True, capture_output=True, check=True)
    for (text, names, advances), actual in zip(expected, json.loads(renderer.stdout), strict=True):
        assert actual == [names, advances], (model, text, 'vector shaping differs from HarfBuzz')
    for size in (180, 400):
        face = ImageFont.truetype(str(path), size)
        for length in (2, 3):
            for chars in itertools.product('imou', repeat=length):
                lower = ''.join(chars)
                for text in (lower, lower.capitalize()):
                    mask = Image.new('L', (int(face.getlength(text)) + 80, size + 100))
                    ImageDraw.Draw(mask).text((30, 20), text, font=face, fill=255, features=['calt'])
                    _, components = label(np.array(mask) > 100, structure=np.ones((3, 3)))
                    # One joined body; every lowercase i contributes a separate dot.
                    assert components == 1 + text.count('i'), (model, size, text, components)
    print(model + ': full glyph colors use the exact font contours and HarfBuzz forms; joins remain connected; i dots stay separate.')
