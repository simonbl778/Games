#!/usr/bin/env python3
"""Check the bundled school print font, its alphabet and round single-storey a.

Requires assets/school-fonts/requirements.txt. This is a font raster check,
not a browser or Android-device test.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import uharfbuzz as hb
import json, subprocess

ROOT=Path(__file__).resolve().parent.parent
path=ROOT/'docs/silbengenerator/fonts/FibelNord.ttf'
font=TTFont(path);cmap=font.getBestCmap()
assert font['name'].getDebugName(6)=='FibelNord'
assert font['OS/2'].fsType==0
alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß'
assert all(ord(c) in cmap for c in alphabet)
# A round single-storey a follows the same left bowl as o, with no upper hood.
size=600;face=ImageFont.truetype(str(path),size)
letters=[]
for char in 'ao':
    mask=Image.new('L',(720,720));ImageDraw.Draw(mask).text((30,450),char,font=face,fill=255,anchor='ls')
    letters.append(np.array(mask))
a=font['glyf'][cmap[ord('a')]];o=font['glyf'][cmap[ord('o')]]
assert (a.yMin,a.yMax)==(o.yMin,o.yMax)
edge=30+round((a.xMin+.4*(a.xMax-a.xMin))*size/font['head'].unitsPerEm)
assert np.array_equal(letters[0][:,:edge],letters[1][:,:edge]),'a has lost the circular schoolbook bowl'
# No current chapter can fall back to missing-glyph boxes, including case changes.
syllables=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {LEVELS} from './docs/silbengenerator/curriculum.js';process.stdout.write(JSON.stringify(LEVELS.at(-1).syllables));"],cwd=ROOT,text=True))
shaper=hb.Font(hb.Face(path.read_bytes()))
for syllable in syllables:
    for text in (syllable,syllable.capitalize()):
        buffer=hb.Buffer();buffer.add_str(text);buffer.guess_segment_properties();hb.shape(shaper,buffer,{'liga':False})
        assert all(g.codepoint for g in buffer.glyph_infos),text
        assert sum(p.x_advance for p in buffer.glyph_positions)>0,text
# Capitals, umlauts and descenders fit the reading line.
low=min(font['glyf'][cmap[ord(c)]].yMin for c in alphabet)
high=max(font['glyf'][cmap[ord(c)]].yMax for c in alphabet)
assert (high-low)/font['head'].unitsPerEm < 1.1
print('School print passed: complete chapter coverage, round single-storey a, German letters, embedded font and line bounds.')
