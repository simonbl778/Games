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
try{
 let view=await open();const {$,window}=view;
 assert.equal($('level-select').options.length,41);
 $('level-select').value='a06';$('level-select').dispatchEvent(new window.Event('change',{bubbles:true}));
 for(const input of view.document.querySelectorAll('[name="known-syllable"]'))input.checked=['ma','me'].includes(input.value);
 $('syllable-options').dispatchEvent(new window.Event('change',{bubbles:true}));
 const saved=window.localStorage.getItem('silbengenerator.selection');assert.deepEqual(JSON.parse(saved),{levelId:'a06',syllables:['ma','me']});
 $('select-no-syllables').click();assert.equal($('start-button').disabled,true);assert.equal($('selection-error').hidden,false);
 view.document.querySelector('[name="known-syllable"][value="me"]').checked=true;
 $('syllable-options').dispatchEvent(new window.Event('change',{bubbles:true}));assert.equal($('start-button').disabled,false);
 view.document.querySelector('[name="reading-font"][value="va"]').checked=true;
 $('setup-form').dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.equal($('game-screen').hidden,false);assert.equal($('completed-count').textContent,'0');assert.equal($('elapsed-time').textContent,'00:00');assert.equal(sounds,0);
 assert.ok($('chain-text').querySelectorAll('line').length===3);
 now=1000;$('chain-button').click();assert.equal($('completed-count').textContent,'1');assert.equal(sounds,3);
 $('chain-button').click();assert.equal($('completed-count').textContent,'1');assert.equal(sounds,3);
 now=65000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:05');
 hidden=true;view.document.dispatchEvent(new window.Event('visibilitychange'));now+=60000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:05');
 hidden=false;view.document.dispatchEvent(new window.Event('visibilitychange'));now+=2000;intervals.at(-1)();assert.equal($('elapsed-time').textContent,'01:07');
 $('settings-button').click();assert.equal($('practice-clock').hidden,true);assert.equal($('setup-screen').hidden,false);
 const persisted=window.localStorage.getItem('silbengenerator.selection');
 view=await open(persisted);assert.equal(view.$('level-select').value,'a06');assert.deepEqual([...view.document.querySelectorAll('[name="known-syllable"]:checked')].map(n=>n.value),['me']);
 assert.equal(view.$('practice-count').hidden,true);
 view.$('setup-form').dispatchEvent(new view.window.Event('submit',{bubbles:true,cancelable:true}));await flush();
 assert.equal(view.$('completed-count').textContent,'0');assert.equal(view.$('elapsed-time').textContent,'00:00');assert.equal(view.$('chain-text').querySelector('svg'),null);
 view.$('settings-button').click();
 console.log('Actual app DOM passed: chapter/custom persistence, restart, handwriting guides, print, completed count, reward trigger, debounce, active timer and settings pause.');
}finally{
 for(const window of windows)window.close();
 for(const [name,descriptor] of originals){if(descriptor)Object.defineProperty(globalThis,name,descriptor);else delete globalThis[name];}
}
