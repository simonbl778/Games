#!/usr/bin/env python3
"""Raster-check the actual renderer for all workbook syllables and sampled chains.

Requires the Python development dependencies in assets/school-fonts/requirements.txt.
This is a vector/font check, not a device or browser test.
"""
import json,fitz,numpy as np,pathops
from scipy.ndimage import label
from pathlib import Path
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.svgPathPen import SVGPathPen
import subprocess,tempfile
ROOT=Path(__file__).resolve().parent.parent
with tempfile.NamedTemporaryFile(suffix='.json') as temporary:
 subprocess.run(['node',str(ROOT/'scripts/render-native-font-cases.mjs'),temporary.name],cwd=ROOT,check=True)
 cases=json.loads(Path(temporary.name).read_text())
failures=[];worst=(0,None)
def mask(svg):
 d=fitz.open('svg',svg.encode());p=fitz.open('pdf',d.convert_to_pdf());pix=p[0].get_pixmap();a=np.frombuffer(pix.samples,np.uint8).reshape(pix.height,pix.width,pix.n);return a[:,:,:3].mean(axis=2)<128
for case in cases:
 count=label(mask(case['svg']),structure=np.ones((3,3)))[1];expected=1+sum(case['text'].count(c) for c in 'ij')+2*sum(case['text'].count(c) for c in 'äöüÄÖÜ')
 maximum=expected
 if case['reference']:maximum+=max(0,label(mask(case['reference']),structure=np.ones((3,3)))[1]-1-(2 if case['text'][0] in 'ÄÖÜ' else 0))
 if not expected<=count<=maximum:failures.append((case['model'],case['text'],count,(expected,maximum)))
 if not case['glyphs']:continue
 previous=[]
 for g in case['glyphs']:
  p=pathops.Path();parse_path(g['path'],TransformPen(p.getPen(),(1,0,0,1,g['x'],0)))
  if g['character'] in 'aodgqäöe' and not g['helper']:
   for contour in p.contours:
    if contour.clockwise:continue
    a,b,c,d=contour.bounds
    relevant=[old for old in previous if old.bounds[2]>=a and old.bounds[0]<=c and old.bounds[3]>=b and old.bounds[1]<=d]
    if not relevant:continue
    prefix=f'<svg xmlns="http://www.w3.org/2000/svg" width="{int((c-a+4)*.4)+1}" height="{int((d-b+4)*.4)+1}" viewBox="{a-2} {b-2} {c-a+4} {d-b+4}">'
    pen=SVGPathPen(None);contour.draw(pen);hole=mask(prefix+f'<path d="{pen.getCommands()}" fill="#000" stroke="#fff" stroke-width="5"/></svg>')
    pen=SVGPathPen(None)
    for old in relevant:old.draw(pen)
    ink=mask(prefix+f'<path d="{pen.getCommands()}" fill="#000"/></svg>');intrusion=int((hole&ink).sum())
    if intrusion>worst[0]:worst=(intrusion,(case['model'],case['text'],g['character']))
  if p:previous.append(p)
print('Native renderer:',len(cases),'cases;',len(failures),'connection/dot mismatches:',failures[:15]);print('Largest earlier stroke inside inset following oval (pixels):',worst)
assert not failures, failures[:15]
assert worst[0] <= 3, worst
print('Connected bodies and separate dots preserved; no stroke crosses the following oval.')
