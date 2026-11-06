#!/usr/bin/env python3
"""Check school-font coverage and actual continuous joins, including initial capitals.

Requires the development dependencies in assets/school-fonts/requirements.txt.
No Android device or browser is needed for these font-specific checks.
"""
from pathlib import Path
import itertools
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy.ndimage import label
from fontTools.ttLib import TTFont
import uharfbuzz as hb

ROOT = Path(__file__).resolve().parent.parent
for model in ('LA', 'VA'):
    path = ROOT / 'docs/silbengenerator/fonts' / f'Silben{model}.ttf'
    font = TTFont(path)
    assert all(ord(char) in font.getBestCmap() for char in 'IMOUimou ')
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
    print(model + ': available chains shape correctly; initial capitals and lowercase joins remain connected; i dots stay separate.')
