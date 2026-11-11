import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../docs/silbengenerator/curriculum.js';
import {generateChain} from '../docs/silbengenerator/generator.js';
import {layoutSchoolChain} from '../docs/silbengenerator/school-script.js';
import {SCHOOL_OUTLINES} from '../docs/silbengenerator/fonts/school-outlines.js';

test('Kapitel und eigene Auswahl erzeugen ausschließlich die gewählten Silben',()=>{
 for(const level of LEVELS){
  const selected=level.syllables.slice(-3);
  for(let i=0;i<8;i++){
   const chain=generateChain(5,{syllables:selected});
   assert.ok(chain.syllables.every(s=>selected.includes(s)));assert.equal(chain.count,chain.syllables.length);
  }
 }
 assert.throws(()=>generateChain(3,{syllables:[]}));
});
for(const model of ['la','va']){
 test(`${model}: spätere Kapitel inklusive Umlaute, ß und Lautverbindungen sind darstellbar`,()=>{
  for(const text of ['Memo','Lama','Tila','Schüle','Äu','Ömi','Über','Pfäu','Achs','Quau','Xy','meichs']){
   const run=layoutSchoolChain({text,syllables:[text]},model,true);
   assert.equal(run.glyphs.map(g=>g.character).join(''),text);
   assert.ok(Number.isFinite(run.width)&&run.width>0&&run.height>=1200);
   for(const g of run.glyphs){assert.ok(!/NaN|Infinity/.test(g.path));assert.ok(Number.isFinite(g.x));}
  }
  const font=SCHOOL_OUTLINES[model];
  for(const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÜäöüß')assert.ok(font.native.codes[font.native.cmap[char]]);
 });
 test(`${model}: Farben verändern bei erweiterten Silben weder Körper noch gemeinsame Schwünge`,()=>{
  const chain={text:'Schüle',syllables:['schü','le']};
  const shape=colored=>layoutSchoolChain(chain,model,colored).glyphs.map(({color,connection,...g})=>({...g,connection:connection?((({color,...c})=>c)(connection)):null}));
  assert.deepEqual(shape(false),shape(true));
  const run=layoutSchoolChain(chain,model,true);
  assert.ok(run.glyphs.some(g=>g.connection?.color==='var(--syllable-alt)'));
  for(const g of run.glyphs.filter(g=>g.connection))assert.equal(g.connection.fraction,.5);
 });
}
