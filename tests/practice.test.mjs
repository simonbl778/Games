import test from 'node:test';
import assert from 'node:assert/strict';
import {PracticeSession,formatPracticeTime} from '../docs/silbengenerator/practice.js';
import {LEVELS,getLevel,normalizeSelection,readSelection,saveSelection} from '../docs/silbengenerator/curriculum.js';

test('Übungsstart zählt keine ungelesene Kette; Weiter zählt jeweils eine abgeschlossene Kette',()=>{
 let time=0;const session=new PracticeSession(()=>time);session.complete();assert.equal(session.snapshot().count,0);
 session.start();assert.equal(session.snapshot().count,0);session.complete();session.complete();time=61000;
 assert.deepEqual(session.snapshot(),{count:2,elapsedMs:61000});assert.equal(formatPracticeTime(61000),'01:01');
 session.pause();time+=60000;session.complete();assert.equal(session.snapshot().count,2);assert.equal(session.snapshot().elapsedMs,61000);
 session.resume();time+=500;session.stop();time+=10000;assert.equal(session.snapshot().elapsedMs,61500);
 session.start();assert.deepEqual(session.snapshot(),{count:0,elapsedMs:0});
});
test('Minuten und Sekunden ohne Rundungsfehler oder Stundenbegrenzung',()=>{
 for(const [ms,text] of [[0,'00:00'],[999,'00:00'],[59000,'00:59'],[60000,'01:00'],[3600000,'60:00']])assert.equal(formatPracticeTime(ms),text);
});
test('Kapitel folgen der Tabelle und enthalten nur bereits eingeführte Bausteine',()=>{
 assert.equal(LEVELS.length,41);assert.deepEqual(getLevel('a01').syllables,['mu','u']);
 assert.deepEqual(getLevel('a05').syllables.slice(0,5),['mu','mi','mo','ma','me']);
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
