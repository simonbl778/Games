// DOM integration, not a browser/device test. Optional QA dependency:
// npm install --prefix /tmp/silben-dom-qa jsdom@26.1.0
// node scripts/check-practice-dom.mjs /tmp/silben-dom-qa/node_modules/jsdom/lib/api.js [APK-assets-directory]
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const {JSDOM}=await import(pathToFileURL(resolve(process.argv[2])).href);
const game=resolve(process.argv[3]||'docs/silbengenerator');
let now=0,hidden=false,sounds=0,intervals=[],windows=[];
class AudioContext {
 constructor(){this.state='running';this.currentTime=0;this.destination={};}
 createOscillator(){sounds++;return {type:'',frequency:{setValueAtTime(){}},connect(){},start(){},stop(){},disconnect(){}};}
 createGain(){return {gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
}
const originals=new Map();
function global(name,value){if(!originals.has(name))originals.set(name,Object.getOwnPropertyDescriptor(globalThis,name));Object.defineProperty(globalThis,name,{value,writable:true,configurable:true});}
async function open(saved){
 const dom=new JSDOM(readFileSync(resolve(game,'index.html'),'utf8'),{url:'https://reading.invalid/silbengenerator/',pretendToBeVisual:true});windows.push(dom.window);
 const {window}=dom;const {document}=window;
 const style=document.createElement('style');style.textContent=readFileSync(resolve(game,'styles.css'),'utf8');document.head.append(style);
 Object.defineProperty(document,'hidden',{get:()=>hidden,configurable:true});
 document.fonts={async load(){return [{}];},addEventListener(){}};
 window.matchMedia=()=>({matches:false});window.requestAnimationFrame=()=>1;window.cancelAnimationFrame=()=>{};
 Object.defineProperties(window.HTMLElement.prototype,{clientWidth:{get:()=>1000},clientHeight:{get:()=>400}});
 window.HTMLElement.prototype.getBoundingClientRect=()=>({width:200,height:120,left:0,right:200,top:0,bottom:120});
 if(saved)window.localStorage.setItem('silbengenerator.selection',saved);
 for(const [name,value] of Object.entries({window,document,navigator:window.navigator,FormData:window.FormData,getComputedStyle:window.getComputedStyle.bind(window),matchMedia:window.matchMedia,requestAnimationFrame:window.requestAnimationFrame,cancelAnimationFrame:window.cancelAnimationFrame,screen:{orientation:{}},localStorage:window.localStorage,performance:{now:()=>now},AudioContext,setInterval:callback=>{intervals.push(callback);return intervals.length;},clearInterval:()=>{}}))global(name,value);
 await import(pathToFileURL(resolve(game,'app.js')).href+'?qa='+windows.length);
 return {window,document,$:id=>document.getElementById(id)};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
const originalRandom=Math.random;
try{
 Math.random=()=>0.75;
 const {LEVELS}=await import(pathToFileURL(resolve(game,'curriculum.js')).href);
 const {WORDS}=await import(pathToFileURL(resolve(game,'words.js')).href);
 const {availableWords}=await import(pathToFileURL(resolve(game,'reading-generator.js')).href);
 const oldDefaults=LEVELS.find(level=>level.id==='a04').syllables.filter(s=>!['am','im','um','om'].includes(s));
 const migrated=await open(JSON.stringify({levelId:'a04',syllables:oldDefaults}));
 for(const part of ['am','im','um','om'])assert.equal(migrated.document.querySelector(`[name="known-syllable"][value="${part}"]`).checked,true);
 const catalogView=await open(JSON.stringify({levelId:'a04',syllables:LEVELS.find(level=>level.id==='a04').syllables,version:2}));
 const catalogWords=()=>[...catalogView.$('word-list').children].map(item=>item.textContent);
 assert.equal(catalogView.$('word-count-summary').textContent,'11 passende Wörter');
 assert.deepEqual(catalogWords(),['am','im','Mama','Mami','Mia','Mimi','Mio','Momo','Oma','Omi','um']);
 catalogView.$('word-list-details').querySelector('summary').click();
 assert.equal(catalogView.$('word-list-details').open,true);
 const maxOne=catalogView.document.querySelector('[name="max-syllables"][value="1"]');maxOne.checked=true;maxOne.dispatchEvent(new catalogView.window.Event('change',{bubbles:true}));
 assert.equal(catalogView.$('word-count-summary').textContent,'3 passende Wörter');assert.equal(catalogView.$('word-count-limit').textContent,'bis zu 1 Silbe');
 assert.deepEqual(catalogWords(),['am','im','um']);assert.equal(catalogView.$('word-list-details').open,true);
 for(const input of catalogView.document.querySelectorAll('[name="known-syllable"]'))input.checked=input.value==='um';
 catalogView.$('syllable-options').dispatchEvent(new catalogView.window.Event('change',{bubbles:true}));
 assert.equal(catalogView.$('word-count-summary').textContent,'1 passendes Wort');assert.deepEqual(catalogWords(),['um']);
 catalogView.$('select-no-syllables').click();assert.equal(catalogView.$('word-count-summary').textContent,'0 passende Wörter');
 assert.deepEqual(catalogWords(),[]);assert.equal(catalogView.$('word-list').hidden,true);assert.equal(catalogView.$('word-list-empty').hidden,false);
 let view=await open();const {$,window}=view;
 assert.equal($('level-select').options.length,41);
 $('level-select').value='a06';$('level-select').dispatchEvent(new window.Event('change',{bubbles:true}));
 for(const input of view.document.querySelectorAll('[name="known-syllable"]'))input.checked=['ma','me'].includes(input.value);
 $('syllable-options').dispatchEvent(new window.Event('change',{bubbles:true}));
 const saved=window.localStorage.getItem('silbengenerator.selection');assert.deepEqual(JSON.parse(saved),{levelId:'a06',syllables:['ma','me'],version:3});
 $('select-no-syllables').click();assert.equal($('start-button').disabled,true);assert.equal($('selection-error').hidden,false);
 view.document.querySelector('[name="known-syllable"][value="me"]').checked=true;
 $('syllable-options').dispatchEvent(new window.Event('change',{bubbles:true}));
 assert.equal($('start-button').disabled,true);assert.equal($('word-selection-error').hidden,false);
 view.document.querySelector('[name="known-syllable"][value="ma"]').checked=true;
 $('syllable-options').dispatchEvent(new window.Event('change',{bubbles:true}));assert.equal($('start-button').disabled,false);
 view.document.querySelector('[name="reading-font"][value="va"]').checked=true;
 $('setup-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.equal($('game-screen').hidden,false);assert.equal($('completed-count').textContent,'0');assert.equal($('elapsed-time').textContent,'00:00');assert.equal(sounds,0);
 assert.equal($('practice-speed').textContent,'— Silben/min');
 assert.ok($('chain-text').querySelectorAll('line').length===3);
 assert.equal($('chain-text').dataset.syllableCount,'3');
 now=1000;$('chain-button').click();assert.equal($('completed-count').textContent,'3');assert.equal(sounds,3);
 assert.equal($('completed-label').textContent,'Silben gelesen');assert.equal($('practice-speed').textContent,'ca. 180 Silben/min');
 $('chain-button').click();assert.equal($('completed-count').textContent,'3');assert.equal(sounds,3);
 now=65000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:05');
 hidden=true;view.document.dispatchEvent(new window.Event('visibilitychange'));now+=60000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:05');
 hidden=false;view.document.dispatchEvent(new window.Event('visibilitychange'));now+=2000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:07');
 assert.equal($('practice-speed').textContent,'ca. 180 Silben/min','Only completed tasks enter the rate.');
 $('chain-button').click();assert.equal($('completed-count').textContent,'6');assert.equal($('practice-speed').textContent,'ca. 5 Silben/min');
 $('settings-button').click();assert.equal($('practice-clock').hidden,true);assert.equal($('setup-screen').hidden,false);
 const persisted=window.localStorage.getItem('silbengenerator.selection');
 view=await open(persisted);assert.equal(view.$('level-select').value,'a06');assert.deepEqual([...view.document.querySelectorAll('[name="known-syllable"]:checked')].map(n=>n.value),['ma','me']);
 assert.equal(view.$('practice-count').hidden,true);
 let readyFont,query;
 view.document.fonts.load=value=>{query=value;return new Promise(resolve=>{readyFont=resolve;});};
 view.$('setup-form').dispatchEvent(new view.window.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(query,'400 48px "FibelNord"');assert.equal(view.$('game-screen').hidden,true);assert.equal(view.$('start-button').disabled,true);
 readyFont([{}]);await flush();
 assert.equal(view.$('completed-count').textContent,'0');assert.equal(view.$('elapsed-time').textContent,'00:00');assert.equal(view.$('chain-text').querySelector('svg'),null);
 view.$('settings-button').click();
 view.document.fonts.load=async()=>[{}];
 // Reproduce the reported one-syllable Mumm bug through the actual setup form.
 view.$('level-select').value='a04';view.$('level-select').dispatchEvent(new view.window.Event('change',{bubbles:true}));
 for(const input of view.document.querySelectorAll('[name="known-syllable"]'))input.checked=input.value==='mu';
 view.$('syllable-options').dispatchEvent(new view.window.Event('change',{bubbles:true}));
 const one=view.document.querySelector('[name="max-syllables"][value="1"]');one.checked=true;one.dispatchEvent(new view.window.Event('change',{bubbles:true}));
 assert.equal(view.$('start-button').disabled,true);assert.equal(view.$('word-selection-error').hidden,false);
 view.$('setup-form').dispatchEvent(new view.window.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.equal(view.$('game-screen').hidden,true);
 view.document.querySelector('[name="known-syllable"][value="um"]').checked=true;
 view.$('syllable-options').dispatchEvent(new view.window.Event('change',{bubbles:true}));
 assert.equal(view.$('start-button').disabled,false);
 view.$('setup-form').dispatchEvent(new view.window.Event('submit',{bubbles:true,cancelable:true}));await flush();
 for(let i=0;i<16;i++){
  const node=view.$('chain-text');assert.ok(!/mm/i.test(node.textContent));
  assert.ok(['mu','um'].includes(node.textContent.toLowerCase()));
  if(node.dataset.kind==='word')assert.equal(node.textContent,'um');
  now+=300;view.$('chain-button').click();
 }
 view.$('settings-button').click();
 // Exercise the actual app event path, not just the generator, for every stage and maximum.
 for(const level of LEVELS.filter(level=>level.number>=4))for(let maximum=1;maximum<=5;maximum++){
  const doc=view.document,w=view.window,$=view.$;
  $('level-select').value=level.id;$('level-select').dispatchEvent(new w.Event('change',{bubbles:true}));
  const option=doc.querySelector(`[name="max-syllables"][value="${maximum}"]`);option.checked=true;option.dispatchEvent(new w.Event('change',{bubbles:true}));
  const matching=availableWords(level.id,level.syllables,maximum).map(word=>word.text).sort(new Intl.Collator('de',{sensitivity:'accent'}).compare);
  assert.deepEqual([...$('word-list').children].map(item=>item.textContent),matching);
  assert.equal($('word-count-summary').textContent,matching.length===1?'1 passendes Wort':`${matching.length.toLocaleString('de-DE')} passende Wörter`);
  assert.equal(new Set(matching.map(word=>word.toLowerCase())).size,matching.length);
  assert.ok(matching.every(word=>!/mm/i.test(word)));
  if(level.id==='b21'&&maximum>=2){
   const listed=[...$('word-list').children].map(item=>item.textContent);
   assert.ok(listed.indexOf('Ole')<listed.indexOf('Öle'));assert.ok(listed.indexOf('Öle')<listed.indexOf('Oma'));
  }
  assert.equal($('start-button').disabled,false);
  $('setup-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await flush();
  assert.equal($('game-screen').hidden,false);
  assert.equal($('completed-count').textContent,'0');assert.equal($('practice-speed').textContent,'— Silben/min');
  let gap=0,total=0,recent=[];
  for(let i=0;i<12;i++){
   const node=$('chain-text');
   assert.ok(!/mm/i.test(node.textContent),`${level.title}: ${node.textContent}`);
   if(node.dataset.kind==='word'){
    gap=0;const word=WORDS.find(word=>word.text===node.textContent);assert.ok(word);
    assert.ok(word.syllables.every(part=>level.syllables.includes(part.toLowerCase())));
   }else gap++;
   assert.ok(gap<4,`${level.title}, maximum ${maximum}: too many random chains`);
   const syllables=Number(node.dataset.syllableCount);total+=syllables;recent=[...recent,syllables].slice(-5);
   now+=300;$('chain-button').click();
   assert.equal($('completed-count').textContent,String(total));
   const rate=Math.round(recent.reduce((sum,count)=>sum+count,0)*200/recent.length).toLocaleString('de-DE');
   assert.equal($('practice-speed').textContent,`ca. ${rate} Silben/min`);
   assert.equal($('completed-label').textContent,total===1?'Silbe gelesen':'Silben gelesen');
  }
  assert.equal($('completed-count').textContent,String(total));
  $('settings-button').click();
 }
 console.log('Actual app DOM passed: new default blocks, storage migration, syllable totals and last-five speed at every stage/maximum, real-word quota, fonts, debounce, sound and active timer.');
}finally{
 Math.random=originalRandom;
 for(const window of windows)window.close();
 for(const [name,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
}
