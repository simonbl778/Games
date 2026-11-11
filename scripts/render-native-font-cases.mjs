import {layoutSchoolChain} from '../docs/silbengenerator/school-script.js';
import {renderChain} from '../docs/silbengenerator/presentation.js';
import {LEVELS} from '../docs/silbengenerator/curriculum.js';
import {generateChain} from '../docs/silbengenerator/generator.js';
import {writeFileSync} from 'node:fs';
function node(tag='span'){const n={tag,attributes:{},style:{},children:[],value:'',classList:{toggle(){}},setAttribute(k,v){this.attributes[k]=v;},append(...c){this.children.push(...c);},replaceChildren(...c){this.children=c;},set textContent(s){this.value=s;}};n.ownerDocument={createElement:node,createElementNS:(ns,t)=>node(t)};return n;}
function serialize(n){return '<'+n.tag+' '+Object.entries(n.attributes).map(([k,v])=>`${k}="${v.replaceAll('var(--ink)','#000').replaceAll('var(--syllable-alt)','#000')}"`).join(' ')+'>'+n.value+n.children.map(serialize).join('')+'</'+n.tag+'>';}
const pool=LEVELS.at(-1).syllables;
const chains=pool.flatMap(text=>[{text,syllables:[text]},{text:text[0].toUpperCase()+text.slice(1),syllables:[text]}]);
let state=123456;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/2**32;};
for(let i=0;i<80;i++)chains.push(generateChain(5,{syllables:pool,random}));
chains.push({text:'üßdu',syllables:['üß','du']},{text:'lieauüßdupfa',syllables:['lie','au','üß','du','pfa']});
const cases=[];
for(const model of ['la','va'])for(const chain of chains){
 const n=node();renderChain(n,chain,true,model);const svg=n.children[0];const box=svg.attributes.viewBox.split(' ').map(Number);const scale=.22;
 const data=`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(box[2]*scale)}" height="${Math.ceil(box[3]*scale)}" viewBox="${svg.attributes.viewBox}">`+svg.children.slice(2).map(serialize).join('')+'</svg>';
 const run=layoutSchoolChain(chain,model,true);
 const first=run.glyphs.find(g=>g.character);
 const capital=run.native&&first.character===first.character.toUpperCase()?first:null;
 let reference=null;
 if(capital){const b=capital.bounds;reference=`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil((b[2]-b[0]+40)*scale)}" height="${Math.ceil((b[3]-b[1]+40)*scale)}" viewBox="${b[0]-20} ${-b[3]-20} ${b[2]-b[0]+40} ${b[3]-b[1]+40}"><path d="${capital.path}" transform="scale(1 -1)" fill="#000"/></svg>`;}
 cases.push({model,text:chain.text,svg:data,reference,glyphs:run.native?run.glyphs.map(g=>({character:g.character,x:g.x,path:g.path,helper:!!g.helper})):null});
}
writeFileSync(process.argv[2]||'/tmp/silben-native-cases.json',JSON.stringify(cases));console.log('Prepared actual-renderer font cases:',cases.length);
