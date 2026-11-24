import assert from 'node:assert/strict';
import {readFileSync, writeFileSync} from 'node:fs';
import {LEVELS} from '../docs/silbengenerator/curriculum.js';
import {availableWords} from '../docs/silbengenerator/reading-generator.js';
import {WORDS} from '../docs/silbengenerator/words.js';
import {hasLearnedUnits} from '../docs/silbengenerator/reading-units.js';

const root=new URL('../',import.meta.url);
const baseline=JSON.parse(readFileSync(new URL('reports/word-audit-baseline-1.8.0.json',root)));
const collator=new Intl.Collator('de',{sensitivity:'accent'});
let previous=new Set();
const rows=LEVELS.filter(level=>level.part==='A').map(level=>{
  const words=availableWords(level.id).sort((a,b)=>collator.compare(a.text,b.text));
  const texts=new Set(words.map(word=>word.text));
  for(const text of previous)assert.ok(texts.has(text),`${level.title}: ${text} verloren`);
  for(const word of words){
    assert.ok(hasLearnedUnits(word,new Set(level.units)),`${word.text}: unbekannter Lerninhalt`);
    assert.ok(word.syllables.every(part=>level.syllables.includes(part.toLowerCase())));
    assert.ok(!/mm/i.test(word.text));
  }
  if(level.number>=7)assert.equal(words.length,WORDS.filter(word=>word.firstLevel<=level.number).length);
  const introduced=words.filter(word=>!previous.has(word.text)).map(word=>word.text);
  previous=texts;
  return {id:level.id,number:level.number,title:level.title,introduction:level.introduction,
    before:baseline.rows.find(row=>row.id===level.id).counts,
    counts:[1,2,3,4,5].map(maximum=>availableWords(level.id,level.syllables,maximum).length),
    introduced,syllableChoices:level.syllables.length,
    words:words.map(({text,syllables,count})=>({text,syllables,count}))};
});
const audit={version:'1.9.0',date:'2026-11-24',scope:'Arbeitsheft Teil A, Kapitel 1–19; vollständige Silbenauswahl; kumulative Anzahl bis zur jeweiligen Höchstzahl',
  definition:'Eindeutige Schreibungen im redaktionellen Spielwortschatz, einschließlich Namen, Spitznamen, Plural- und Verbformen. Keine vollständige Zählung der deutschen Sprache. Wörter mit mm sind auf Elternwunsch ausgeschlossen.',
  rows:rows.map(row=>({...row,words:row.words.map(word=>word.text)}))};
writeFileSync(new URL('reports/word-audit-part-a.json',root),JSON.stringify(audit,null,2)+'\n');
const csvCell=value=>'"'+String(value).replaceAll('"','""')+'"';
const csv=[['Kapitel','Titel','Neue Lerninhalte','Bis 1 Silbe','Bis 2 Silben','Bis 3 Silben','Bis 4 Silben','Bis 5 Silben','Neu gegenüber vorherigem Kapitel','Bisher bis 5 Silben'],
  ...rows.map(row=>[row.number,row.title,row.introduction,...row.counts,row.introduced.length,row.before[4]])];
writeFileSync(new URL('docs/downloads/Silbengenerator-Wortpruefung-Teil-A.csv',root),'\uFEFF'+csv.map(row=>row.map(csvCell).join(';')).join('\r\n')+'\r\n');
const escape=text=>String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const html=`<!doctype html><html lang="de"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Wortprüfung · Arbeitsheft Teil A · Silbengenerator</title>
<style>body{font:1rem/1.6 system-ui,sans-serif;color:#243e35;background:#f7f5ee;margin:0}main{max-width:68rem;margin:auto;padding:1.5rem}h1{line-height:1.2}h2{margin-top:2rem}a{color:#80503d}table{border-collapse:collapse;width:100%;background:white}th,td{padding:.55rem;text-align:left;border-bottom:1px solid #dbe2d7}th{background:#e6ece1}td:not(:nth-child(2)){font-variant-numeric:tabular-nums}caption{text-align:left;font-weight:600;padding:.5rem 0}.table-wrap{overflow:auto}details{background:white;border:1px solid #dbe2d7;border-radius:.7rem;margin:.8rem 0;padding:.8rem}summary{cursor:pointer;font-weight:600}ul.words{columns:4 10rem;padding-left:1.3rem}li{break-inside:avoid}small{font-size:.875rem}code{font:inherit;background:#edf0e7;padding:.1rem .3rem}@media print{body{background:white}details{break-inside:avoid}a{color:inherit}}</style>
<main><p>Silbengenerator · Version 1.9.0 · geprüft am 24. November 2026</p>
<h1>Wortprüfung für alle 19 Kapitel von Arbeitsheft Teil A</h1>
<p>Es fehlten geschlossene Silben und Wortendsilben in der Auswahl. Deshalb waren zuletzt nur 70 von 244 damals hinterlegten und grundsätzlich freigegebenen Wörtern erreichbar. Die fehlenden Bausteine sind ab Kapitel 7 nun sichtbar auswählbar und bei vollständiger Stufenauswahl ausgewählt. Der Wortschatz wurde zusätzlich redaktionell erweitert. Eigene Abwahlen bleiben verbindlich.</p>
<p><strong>So wird gezählt:</strong> Jede eindeutige Schreibung im Spielwortschatz zählt einmal; Namen und Spitznamen wie Mimi, Omi und Mami zählen mit. Unterschiedliche Verb- und Pluralformen zählen als unterschiedliche Schreibungen. Die Zahlen sind kumulativ und beziehen sich auf die vollständige Silbenauswahl. Eine eigene eingeschränkte Auswahl kann weniger Wörter zulassen. Wörter mit <code>mm</code> bleiben auf Elternwunsch ausgeschlossen.</p>
<p><strong>Dies ist kein vollständiges Wörterbuch:</strong> Die deutsche Sprache erlaubt weitere Wörter und Zusammensetzungen. Buchstabenkenntnis allein garantiert außerdem noch kein flüssiges Lesen oder Wortverständnis. Das Wachstum muss nicht exponentiell sein; Wiederholungskapitel ohne neue Bausteine behalten denselben Bestand.</p>
<div class="table-wrap"><table><caption>Passende Wörter nach eingestellter Höchstzahl</caption><thead><tr><th>Kapitel</th><th>Titel</th>${[1,2,3,4,5].map(n=>`<th>Bis ${n} ${n===1?'Silbe':'Silben'}</th>`).join('')}<th>Neu bis 5</th><th>Bisher bis 5</th></tr></thead><tbody>
${rows.map(row=>`<tr><td>${row.number}</td><td>${escape(row.title)}</td>${row.counts.map(count=>`<td>${count}</td>`).join('')}<td>+${row.introduced.length}</td><td>${row.before[4]}</td></tr>`).join('\n')}</tbody></table></div>
<p><a href="./Silbengenerator-Wortpruefung-Teil-A.csv" download>Tabelle als CSV herunterladen</a></p>
<h2>Empfehlung für das Lesenlernen</h2>
<p>Die folgenden Kapitelgrenzen sind eine Empfehlung für dieses Spiel, keine Vorgabe des Bildungsministeriums:</p>
<ul><li><strong>Kapitel 1–6:</strong> Buchstaben verbinden und kurze Silben lesen; bekannte Namen und kurze Wörter von Anfang an einbeziehen.</li>
<li><strong>Kapitel 7–12:</strong> Echte Wörter deutlich ausbauen. Kurze verständliche Sätze passen, sobald das Zusammenziehen gelingt, etwa <em>Mama malt.</em> ab Kapitel 8 oder <em>Oma ist da.</em> ab Kapitel 12.</li>
<li><strong>Ab Kapitel 13:</strong> Im normalen Üben überwiegend echte Wörter und kleine Sätze verwenden, etwa <em>Sina malt rote Rosen.</em> Die Silbenhilfe kann bleiben.</li>
<li><strong>Spätestens gegen Ende von Teil A:</strong> Sinnvolle Wörter, Sätze und kurze Texte bilden den Schwerpunkt. Zufallssilben nur noch gezielt ergänzen, wenn das Kind bestimmte Verbindungen noch üben muss.</li></ul>
<p>Eine automatische Grenze, ab der ausschließlich echte Wörter pädagogisch sinnvoll wären, lässt sich aus einer Kapitelnummer nicht ableiten. Entscheidend sind sicheres Zusammenziehen und Verstehen. Pseudowörter können das Dekodieren weiterhin gezielt üben; sie ersetzen das Lesen sinnvoller Sprache nicht. Die Wortquoten des Spiels wurden mit dieser Prüfung nicht automatisch umgestellt.</p>
<p><strong>Fachlicher Abgleich:</strong> Das <a href="https://zsl-bw.de/,Lde/Startseite/lernen-ueberall/lernbruecke-grundschule">ZSL Baden-Württemberg</a> stellt für Klassen 1 und 2 sowohl Silben- und Pseudowortübungen als auch Wort-, Satz- und Textmaterial bereit. <a href="https://www.biss-sprachbildung.de/btools/differenzierter-lesetest-dekodieren-dile-d/">BiSS erläutert am DiLe-D</a> die unterschiedlichen Anforderungen von Worterkennung und Pseudowortdekodierung. Daraus folgt keine verpflichtende Kapitelgrenze.</p>
<h2>Alle geprüften Wortlisten von A bis Z</h2><p>Je Kapitel: vollständige Auswahl, höchstens fünf Silben. Innerhalb der Liste bleibt die korrekte Groß- und Kleinschreibung erhalten.</p>
${rows.map(row=>`<details><summary>${row.number}. ${escape(row.title)} · ${row.words.length} Wörter</summary><p>Neu: ${escape(row.introduction)}. ${row.syllableChoices} auswählbare Silbenbausteine.</p><ul class="words">${row.words.map(word=>`<li>${escape(word.text)}</li>`).join('')}</ul></details>`).join('\n')}
</main></html>`;
writeFileSync(new URL('docs/downloads/Silbengenerator-Wortlisten-Teil-A.html',root),html);
console.log(`Alle ${rows.length} Kapitel geprüft; zuletzt ${rows.at(-1).words.length} Wörter. Bericht und CSV erstellt.`);
