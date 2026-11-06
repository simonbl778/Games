#!/usr/bin/env python3
"""Build the two local school fonts from unmodified LPPL schulschriften sources.

Requires MetaPost (including mfplain.mp), fonttools, skia-pathops and svgpathtools.
The original drawing programs supply the letterforms and join components;
OpenType contextual forms and joins replace the original TeX ligature rules for the
eight letters used by the game. VA I/O receive the requested outgoing joins.
"""
from pathlib import Path
import argparse, os, shutil, subprocess, tempfile
import re,xml.etree.ElementTree as ET
from fontTools.tfmLib import TFM
from fontTools.fontBuilder import FontBuilder
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.cu2quPen import Cu2QuPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
import pathops
from svgpathtools import parse_path as svg_path

PROJECT=Path(__file__).resolve().parent.parent
def build(kind):
    tfm = TFM(kind + '.tfm')
    name = 'Silben' + kind.upper()
    metadata = re.search(r'\^\^J\d+ [\d.]+ [\d.]+ [\d.]+ ([\d.]+) ([\d.]+)\^\^J', Path(kind + '-output.log').read_text())
    scale = 1000 / (tfm.designsize * float(metadata[1]) * float(metadata[2]))
    raw, strokes = {}, {}
    def load(code):
        if code in raw:
            return raw[code]
        text = Path(f'{kind}-{code}.svg').read_text()
        box = list(map(float, re.search(r'Original BoundingBox: (.*?) -->', text).group(1).split()))
        total, centerlines = pathops.Path(), []
        for element in ET.fromstring(text).iter():
            if element.tag.rsplit('}', 1)[-1] != 'path':
                continue
            path = pathops.Path()
            parse_path(element.attrib['d'], path.getPen())
            style = element.attrib.get('style', '')
            if 'fill: none' in style:
                curve = svg_path(element.attrib['d'])
                def convert(point):
                    return complex((point.real + box[0]) * scale, (box[3] - point.imag) * scale)
                centerlines.append([convert(curve.point(i / 1000)) for i in range(1001)])
                width = float(re.search(r'stroke-width: ([\d.]+)', style).group(1))
                path.stroke(width, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 10)
                path.convertConicsToQuads(.05)
            transformed = pathops.Path()
            path.draw(TransformPen(transformed.getPen(), (scale, 0, 0, -scale, box[0] * scale, box[3] * scale)))
            total = pathops.op(total, transformed, pathops.PathOp.UNION)
        raw[code], strokes[code] = total, centerlines
        return total
    def combine(parts):
        total, x, previous = pathops.Path(), 0, None
        for code in parts:
            x += tfm.kerning.get(previous, {}).get(code, 0) * 1000
            transformed = pathops.Path()
            load(code).draw(TransformPen(transformed.getPen(), (1, 0, 0, 1, x, 0)))
            total = pathops.op(total, transformed, pathops.PathOp.UNION)
            x += tfm.chars[code]['width'] * 1000
            previous = code
        return total, x
    glyphs, metrics = {}, {}
    def add(glyphname, path, advance):
        pen = TTGlyphPen(None)
        path.draw(Cu2QuPen(pen, max_err=.25, reverse_direction=True))
        glyphs[glyphname] = pen.glyph()
        metrics[glyphname] = (round(advance), round(path.bounds[0]) if path else 0)
    for glyphname in ('.notdef', 'space'):
        add(glyphname, pathops.Path(), 300)
    variants = {}
    for char in 'IMOUimou':
        code = ord(char)
        body, advance = combine([code])
        variants[char] = (body, advance, 0, char)
        if kind == 'la' and char in 'iuo':
            prefix = 128 if char == 'o' else 30
            path, width = combine([prefix, code])
            shift = tfm.chars[prefix]['width'] * 1000
            variants[char + '.init'] = (path, width, shift, char)
    for glyphname, (body, advance, shift, char) in variants.items():
        add(glyphname, body, advance)
        # The original LA word-end forms avoid carrying a full joining stroke past the last letter.
        if kind == 'la' and char != 'o':
            parts = ([128 if char == 'o' else 30] if glyphname.endswith('.init') else []) + [ord(char) + 64]
            final, width = combine(parts)
            add(glyphname + '.fin', final, width)
        for following in 'imou':
            load(ord(following))
            current_strokes = strokes[ord(char)]
            start = current_strokes[-1][-1] + shift
            target_advance = advance
            if kind == 'va' and char in 'IO':
                # VA normally leaves I/O apart. Keep their bodies and spacing, adding the requested join.
                target_advance += 125
                start = (min(current_strokes[-1], key=lambda p: p.imag) if char == 'I'
                         else max((p for p in current_strokes[0] if abs(p.imag - 333) < 2), key=lambda p: p.real))
            incoming = strokes[ord(following)][0]
            if following == 'o':
                end_local = min(incoming, key=lambda p: abs((p + target_advance) - start))
            else:
                end_local = incoming[0]
            target_advance += max(0, start.real + 15 - (end_local.real + target_advance))
            end = end_local + target_advance
            dx = end.real - start.real
            join = pathops.Path()
            pen = join.getPen()
            pen.moveTo((start.real, start.imag))
            pen.curveTo((start.real + dx * .33, start.imag + (end.imag - start.imag) * .25),
                        (end.real - dx * .25, end.imag - min(25, abs(end.imag - start.imag) * .2)),
                        (end.real, end.imag))
            pen.endPath()
            join.stroke(20.8, pathops.LineCap.ROUND_CAP, pathops.LineJoin.ROUND_JOIN, 10)
            join.convertConicsToQuads(.05)
            joined = pathops.op(body, join, pathops.PathOp.UNION)
            add(glyphname + '.to.' + following, joined, target_advance)
    letters = ' '.join(g for g in glyphs if g not in ('.notdef', 'space'))
    features = [f'@Letters = [{letters}];']
    if kind == 'la':
        features += ["lookup Initial { ignore sub @Letters [i u o]';"]
        features += [f"sub {c}' by {c}.init;" for c in 'iuo'] + ['} Initial;']
    features += ['lookup Join {']
    features += [f"sub {g}' {b} by {g}.to.{b};" for g in variants for b in 'imou']
    features += ['} Join;']
    if kind == 'la':
        features += ["lookup Final { ignore sub @Letters' @Letters;"]
        features += [f"sub {g}' by {g}.fin;" for g in variants if variants[g][3] != 'o']
        features += ['} Final;']
    features += ['feature calt { ' + ('lookup Initial; ' if kind == 'la' else '') + 'lookup Join; ' + ('lookup Final;' if kind == 'la' else '') + ' } calt;']
    builder = FontBuilder(1000, isTTF=True)
    builder.setupGlyphOrder(list(glyphs))
    builder.setupCharacterMap({ord(c): c for c in 'IMOUimou'} | {32: 'space'})
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics(metrics)
    builder.setupHorizontalHeader(ascent=800, descent=-350, lineGap=50)
    builder.setupNameTable({'familyName': name, 'styleName': 'Regular', 'uniqueFontIdentifier': name + '1',
        'fullName': name, 'psName': name, 'version': 'Version 1.000',
        'copyright': 'Letterforms: Walter Entenmann, schulschriften (2011-2021), LPPL 1.3c. OpenType adaptation and joins: Games project, 2026.',
        'licenseDescription': 'LaTeX Project Public License 1.3c or later', 'licenseInfoURL': 'https://www.latex-project.org/lppl/lppl-1-3c/'})
    builder.setupOS2(sTypoAscender=800, sTypoDescender=-350, sTypoLineGap=50, usWinAscent=800, usWinDescent=350)
    builder.setupPost()
    addOpenTypeFeaturesFromString(builder.font, '\n'.join(features))
    builder.font.recalcTimestamp = False
    builder.font['head'].created = builder.font['head'].modified = 3876854400
    builder.save(name + '.ttf')
    print(name + ': built local school font.')

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument('--metapost-base',type=Path,help='Directory containing mfplain.mp if not on the MetaPost search path')
 parser.add_argument('--output',type=Path,default=PROJECT/'docs/silbengenerator/fonts')
 args=parser.parse_args();output=args.output.resolve();output.mkdir(parents=True,exist_ok=True)
 with tempfile.TemporaryDirectory(prefix='silben-fonts-') as temporary:
  work=Path(temporary)
  for kind,model in [('la','wela'),('va','weva')]:
   source=work/(kind+'-source');source.mkdir()
   for f in (PROJECT/'assets/school-fonts'/model).glob('*.mf'):
    shutil.copyfile(f,source/f.with_suffix('.mp').name)
   driver=work/(kind+'.mp')
   driver.write_text('input mfplain;\nmode:=lowres; mag:=36;\noutputformat := "svg";\noutputtemplate := "%j-%c.svg";\nextra_endchar := "message char 10 & decimal charcode & char 32 & decimal w & char 32 & decimal h & char 32 & decimal d & char 32 & decimal pt & char 32 & decimal bp_per_pixel & char 10;";\ninput '+model+'sl14;\n')
   env=os.environ.copy();env['MPINPUTS']=':'.join([str(source),str(args.metapost_base.resolve()) if args.metapost_base else '',env.get('MPINPUTS',''),''])
   with (work/(kind+'-output.log')).open('w') as log:
    subprocess.run(['mpost','-ini','-interaction=nonstopmode',driver.name],cwd=work,env=env,stdout=log,stderr=subprocess.STDOUT,check=True)
  previous=Path.cwd()
  try:
   os.chdir(work)
   for kind in ('la','va'):
    build(kind);shutil.copyfile(work/('Silben'+kind.upper()+'.ttf'),output/('Silben'+kind.upper()+'.ttf'))
  finally:os.chdir(previous)

if __name__=='__main__':main()
