import test from 'node:test';
import assert from 'node:assert/strict';
import {PracticeSession,formatPracticeTime,formatReadingSpeed} from '../docs/silbengenerator/practice.js';
import {LEVELS,getLevel,normalizeSelection,readSelection,saveSelection} from '../docs/silbengenerator/curriculum.js';

test('erst Weiter zählt tatsächliche Silben: drei und zwei ergeben fünf',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.complete(3);assert.equal(session.snapshot().count,0);
 session.start();assert.equal(session.snapshot().count,0);session.beginTask();time=3000;session.complete(3);assert.equal(session.snapshot().count,3);
 session.beginTask();time=5000;session.complete(2);time=61000;
 assert.deepEqual(session.snapshot(),{count:5,elapsedMs:61000,syllablesPerMinute:60});assert.equal(formatPracticeTime(61000),'01:01');
 session.pause();time+=60000;session.complete(5);assert.equal(session.snapshot().count,5);assert.equal(session.snapshot().elapsedMs,61000);
 session.resume();time+=500;session.stop();time+=10000;assert.equal(session.snapshot().elapsedMs,61500);
 session.start();assert.deepEqual(session.snapshot(),{count:0,elapsedMs:0,syllablesPerMinute:null});
});
test('Minuten und Sekunden ohne Rundungsfehler oder Stundenbegrenzung',()=>{
 for(const [ms,text] of [[0,'00:00'],[999,'00:00'],[59000,'00:59'],[60000,'01:00'],[3600000,'60:00']])assert.equal(formatPracticeTime(ms),text);
});
test('Kapitel folgen der Tabelle und enthalten nur bereits eingeführte Bausteine',()=>{
 assert.equal(LEVELS.length,41);assert.deepEqual(getLevel('a01').syllables,['mu','u']);
 for(const s of ['mu','mi','mo','ma','me','em'])assert.ok(getLevel('a05').syllables.includes(s));
 for(const s of ['am','im','um','om']){
  assert.ok(!getLevel('a03').syllables.includes(s));assert.ok(getLevel('a04').syllables.includes(s));
  assert.ok(normalizeSelection({levelId:'a04'}).syllables.includes(s));
 }
 for(const s of ['em','me','e'])assert.ok(!getLevel('a04').syllables.includes(s));
 assert.ok(getLevel('a04').syllables.includes('ma'));assert.ok(getLevel('a04').syllables.includes('a'));assert.ok(!getLevel('a04').syllables.includes('me'));
 assert.ok(!getLevel('a13').syllables.some(s=>s.startsWith('sch')));assert.ok(getLevel('a14').syllables.includes('schü'));
 assert.ok(getLevel('b15').syllables.includes('qua'));assert.ok(!getLevel('b15').syllables.includes('quu'));
 for(let i=2;i<LEVELS.length;i++)for(const s of LEVELS[i-1].syllables)assert.ok(LEVELS[i].syllables.includes(s),`${LEVELS[i].id}: ${s}`);
 assert.ok(getLevel('b21').syllables.includes('ei'));assert.ok(getLevel('b21').syllables.includes('achs'));
});
test('Stufe und individuelle Auswahl überstehen einen Neustart; ungültige Daten bleiben harmlos',()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 saveSelection(storage,{levelId:'a04',syllables:['ma','a','unbekannt']});assert.deepEqual(readSelection(storage),{levelId:'a04',syllables:['ma','a']});
 assert.deepEqual(normalizeSelection({levelId:'falsch'}),normalizeSelection());
 storage.setItem('silbengenerator.selection','{');assert.deepEqual(readSelection(storage),normalizeSelection());
 assert.deepEqual(readSelection({getItem(){throw Error();}}),normalizeSelection());
 assert.doesNotThrow(()=>saveSelection({setItem(){throw Error();}},{levelId:'a01',syllables:['mu']}));
});

test('Tempo gewichtet Silben und Zeiten statt einzelne Geschwindigkeiten zu mitteln',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.start();session.beginTask();
 time=3000;session.complete(3);session.beginTask();time=15000;session.complete(2);
 assert.equal(session.snapshot().syllablesPerMinute,20);
 time=115000;assert.equal(session.snapshot().syllablesPerMinute,20,'Unbestätigte Aufgaben verändern abgeschlossene Aufgaben nicht.');
});

test('nur die letzten fünf abgeschlossenen Aufgaben bestimmen das Tempo; alle Silben bleiben im Gesamtzähler',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.start();
 for(const [syllables,duration] of [[5,30000],[1,1000],[1,1000],[1,1000],[1,1000]]){
  session.beginTask();time+=duration;session.complete(syllables);
 }
 assert.equal(session.snapshot().count,9);assert.equal(session.snapshot().syllablesPerMinute,9*60000/34000);
 session.beginTask();time+=1000;session.complete(1);
 assert.equal(session.snapshot().count,10);assert.equal(session.snapshot().syllablesPerMinute,60);
});

test('Hintergrund und das Vorbereiten der nächsten Anzeige zählen nicht zur Lesezeit',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.start();session.beginTask();
 time=2000;session.pause();time=62000;session.complete(5);assert.equal(session.snapshot().count,0);
 session.resume();time=65000;session.complete(3);
 assert.equal(session.snapshot().elapsedMs,5000);assert.equal(session.snapshot().syllablesPerMinute,36);
 time=66000;session.beginTask();time=68000;session.complete(2);
 assert.equal(session.snapshot().count,5);assert.equal(session.snapshot().syllablesPerMinute,5*60000/7000);
 session.stop();time+=10000;session.complete(2);assert.equal(session.snapshot().count,5);
 session.start();assert.equal(session.snapshot().syllablesPerMinute,null);
});

test('Nullzeit zeigt kein unendliches Tempo; ungültige Silbenzahlen verändern nichts',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.start();session.complete(3);
 assert.equal(session.snapshot().count,3);assert.equal(session.snapshot().syllablesPerMinute,null);
 for(const value of [0,6,-1,1.5,NaN,Infinity,'3',null])assert.throws(()=>session.complete(value),RangeError);
 assert.equal(session.snapshot().count,3);
 time=1000;session.complete(2);assert.ok(Number.isFinite(session.snapshot().syllablesPerMinute));
});

test('Tempo bleibt ein gerundeter und gekennzeichneter Schätzwert',()=>{
 for(const value of [null,undefined,NaN,Infinity,-1])assert.equal(formatReadingSpeed(value),'— Silben/min');
 assert.equal(formatReadingSpeed(45.4),'ca. 45 Silben/min');assert.equal(formatReadingSpeed(45.8),'ca. 46 Silben/min');
 assert.equal(formatReadingSpeed(1234.5),'ca. 1.235 Silben/min');
});

test('alte vollständige Standardauswahlen erhalten neue Silben einmalig; eigene Abwahlen bleiben erhalten',()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 for(const id of ['a04','a05','b01','b21']){
  const level=getLevel(id),additions=new Set(['am','im','um','om','em']);
  const old=level.legacySyllables.filter(s=>!additions.has(s));
  storage.setItem('silbengenerator.selection',JSON.stringify({levelId:id,syllables:old}));
  assert.deepEqual(readSelection(storage),{levelId:id,syllables:[...level.syllables]});
  saveSelection(storage,{levelId:id,syllables:old});
  assert.deepEqual(readSelection(storage),{levelId:id,syllables:old});
 }
 storage.setItem('silbengenerator.selection',JSON.stringify({levelId:'a04',syllables:['ma','a']}));
 assert.deepEqual(readSelection(storage),{levelId:'a04',syllables:['ma','a']});
});

test('vollständige Auswahl aus Version 2 erhält Wortendsilben; eigene Abwahlen bleiben beim Update erhalten',()=>{
 const map=new Map();const storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 for(const id of ['a07','a13','a19','b21']){
  const level=getLevel(id);
  storage.setItem('silbengenerator.selection',JSON.stringify({levelId:id,syllables:level.legacySyllables,version:2}));
  assert.deepEqual(readSelection(storage).syllables,level.syllables);
  assert.ok(level.syllables.length>level.legacySyllables.length);
  const own=level.legacySyllables.filter(s=>s!=='ma');
  storage.setItem('silbengenerator.selection',JSON.stringify({levelId:id,syllables:own,version:2}));
  assert.deepEqual(readSelection(storage).syllables,own);
  saveSelection(storage,{levelId:id,syllables:level.legacySyllables});
  assert.deepEqual(readSelection(storage).syllables,level.legacySyllables);
 }
});
