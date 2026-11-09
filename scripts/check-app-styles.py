#!/usr/bin/env python3
"""Check the actual app DOM/CSS cascade, also directly from the packaged APK.

This integration check covers inherited SVG icon styles and syllable colors.
It is a CSS cascade check, not a device or browser test.
"""
import argparse
import json
from pathlib import Path
import re
import subprocess
import tempfile
import zipfile
import cssselect2
import tinycss2
from lxml import etree, html

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--apk', type=Path)
parser.add_argument('--model', choices=['print','la','va'])
parser.add_argument('--css', type=Path, help='Alternate CSS for regression reproduction')
args = parser.parse_args()
with tempfile.TemporaryDirectory(prefix='silben-app-style-') as temporary:
    base = ROOT / 'docs/silbengenerator'
    if args.apk:
        base = Path(temporary) / 'silbengenerator'
        with zipfile.ZipFile(args.apk) as archive:
            for name in archive.namelist():
                if name.startswith('assets/silbengenerator/') and not name.endswith('/'):
                    target = Path(temporary) / name.removeprefix('assets/')
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(name))
        (Path(temporary) / 'package.json').write_text('{"type":"module"}')
    code = r'''
import { pathToFileURL } from 'node:url';
const { renderChain } = await import(pathToFileURL(process.argv[1]).href);
function node(tag='span') {
 const classes = new Set();
 const n = {tag,attributes:{},style:{},children:[],value:'',
  classList:{toggle(c,on){on?classes.add(c):classes.delete(c);}},
  setAttribute(k,v){this.attributes[k]=v;},append(...c){this.children.push(...c);},
  replaceChildren(...c){this.children=c;this.value='';},
  set textContent(t){this.children=[];this.value=t;},
  toJSON(){return {tag:this.tag,attributes:{...this.attributes,class:[...(this.attributes.class?[this.attributes.class]:[]),...(this.className?[this.className]:[]),...classes].join(' ')},style:this.style,children:this.children,value:this.value};}};
 n.ownerDocument={createElement:node,createElementNS:(ns,tag)=>node(tag)};
 return n;
}
const outputs=[];
for(const model of ['print','la','va']) for(const colors of [false,true]) {
 const n=node(); renderChain(n,{text:'Amuaio',syllables:['a','mu','a','i','o']},colors,model);
 outputs.push({model,colors,node:n});
}
process.stdout.write(JSON.stringify(outputs));
'''
    cases = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', code, str(base / 'presentation.js')], text=True))
    css = (args.css or base / 'styles.css').read_text()
    source_html = (base / 'index.html').read_text()
    def media_matches(text, width, height):
        for feature, value in re.findall(r'\(([\w-]+)\s*:\s*([^)]+)\)', text):
            if feature == 'orientation' and value.strip() != ('landscape' if width > height else 'portrait'):
                return False
            if feature == 'prefers-reduced-motion':
                return False
            if feature.startswith(('max-', 'min-')):
                actual = width if feature.endswith('width') else height
                limit = float(value.strip().removesuffix('px'))
                if feature.startswith('max-') and actual > limit or feature.startswith('min-') and actual < limit:
                    return False
        return True
    for width, height in [(1280,720),(960,540),(800,360),(390,844)]:
        matcher = cssselect2.Matcher()
        def add_rules(rules):
            for rule in rules:
                if rule.type == 'at-rule' and rule.lower_at_keyword == 'media' and media_matches(tinycss2.serialize(rule.prelude),width,height):
                    add_rules(tinycss2.parse_rule_list(rule.content,skip_whitespace=True,skip_comments=True))
                elif rule.type == 'qualified-rule':
                    declarations = [(d.lower_name,tinycss2.serialize(d.value).strip(),d.important) for d in tinycss2.parse_declaration_list(rule.content,skip_whitespace=True,skip_comments=True) if d.type=='declaration']
                    selector_text = tinycss2.serialize(rule.prelude)
                    if '::backdrop' in selector_text:
                        continue
                    for selector in cssselect2.compile_selector_list(selector_text):
                        matcher.add_selector(selector,declarations)
        add_rules(tinycss2.parse_stylesheet(css,skip_whitespace=True,skip_comments=True))
        for case in cases:
            if args.model and case['model'] != args.model:
                continue
            root=html.fromstring(source_html)
            body=root.find('body');body.set('class','game-mode'+(' cursive-reading '+case['model']+'-reading' if case['model']!='print' else ''))
            target=root.xpath('//*[@id="chain-text"]')[0]
            def populate(element,node):
                for key,value in node['attributes'].items():
                    if key=='class':element.set(key,(element.get(key,'')+' '+value).strip())
                    else:element.set(key,value)
                if node['style']:element.set('style',';'.join(k+':'+v for k,v in node['style'].items()))
                element.text=node['value']
                for child in node['children']:
                    tag=('{http://www.w3.org/2000/svg}'+child['tag']) if child['tag'] in ('svg','g','path','title','line') else child['tag']
                    populate(etree.SubElement(element,tag),child)
            populate(target,case['node'])
            computed={}
            for wrapped in cssselect2.ElementWrapper.from_html_root(root).iter_subtree():
                element=wrapped.etree_element;parent=computed.get(element.getparent(),{})
                declarations={k:((False,(0,0,0,0),-1),v) for k,v in element.attrib.items() if k in ('fill','stroke','stroke-width','width','height')}
                for specificity,order,pseudo,values in matcher.match(wrapped):
                    if pseudo is not None:
                        continue
                    for key,value,important in values:
                        rank=(important,(0,*specificity),order)
                        if key not in declarations or rank>=declarations[key][0]:declarations[key]=(rank,value)
                for d in tinycss2.parse_declaration_list(element.get('style',''),skip_whitespace=True,skip_comments=True):
                    if d.type=='declaration':declarations[d.lower_name]=((d.important,(1,0,0,0),0),tinycss2.serialize(d.value).strip())
                style={k:v for k,v in parent.items() if k.startswith('--') or k in ('color','fill','stroke','stroke-width')}
                style.update({k:v for k,(rank,v) in declarations.items()})
                def resolve(value):
                    while 'var(' in value:
                        updated=re.sub(r'var\((--[\w-]+)\)',lambda m:style.get(m[1],m[0]),value)
                        if updated==value:break
                        value=updated
                    return style.get('color','#000000') if value.lower()=='currentcolor' else value
                if 'color' in style:style['color']=resolve(style['color'])
                for key in ('fill','stroke','stroke-width'):
                    if key in style:style[key]=resolve(style[key])
                computed[element]=style
            prefix=(case['model'],case['colors'],width,height)
            if case['model']!='print':
                svg=target[0];assert computed[svg].get('stroke','none')=='none',(prefix,'icon outline leaked into word SVG',computed[svg].get('stroke'))
                assert computed[svg]['width'].endswith('em') and computed[svg]['height']=='1.2em',prefix
                assert len(svg[1])==3,(prefix,'three handwriting guide lines required')
                for line in svg[1]:
                    assert computed[line]['stroke']=='#253e38',(prefix,'missing guide stroke')
                    assert computed[line]['stroke-width']=='1',(prefix,'guide stroke width')
                    assert line.get('stroke-opacity')=='0.16' and line.get('vector-effect')=='non-scaling-stroke',prefix
                for path in svg[2]:
                    index=int(path.get('data-syllable'))
                    color='#9b4b46' if case['colors'] and index%2 else '#253e38'
                    assert computed[path]['fill']==color,(prefix,index,computed[path]['fill'])
                    assert computed[path].get('stroke','none')=='none',(prefix,'extra letter outline')
            elif case['colors']:
                for index,span in enumerate(target):
                    assert computed[span]['color']==('#9b4b46' if index%2 else '#253e38'),(prefix,'print syllable',index,computed[span]['color'])
            icon=root.xpath('//*[@id="tap-hint"]')[0][0]
            assert computed[icon].get('stroke') not in (None,'none'),(prefix,'tap icon lost its outline')
    print('Actual app CSS passed: complete glyph fills, no icon outlines on handwriting, red syllables in all three modes, phone/tablet sizes.')
