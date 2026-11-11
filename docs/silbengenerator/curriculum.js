import { SYLLABLES } from './config.js';

// Kapitelreihenfolge und neue Lerninhalte aus der bereitgestellten Inhaltsübersicht.
// Silbenketten sind Leseübungen; die Kapiteltexte und Aufgaben werden nicht übernommen.
const chapters = [
  ['a01','A','mu','mu',{blocks:['mu'],onsets:['m'],vowels:['u']}],
  ['a02','A','Mimi','Mi mi',{blocks:['mi'],vowels:['i']}],
  ['a03','A','Momo','Mo mo',{blocks:['mo'],vowels:['o']}],
  ['a04','A','Mama','Ma ma',{blocks:['ma'],vowels:['a']}],
  ['a05','A','Memo','Me me',{blocks:['me'],vowels:['e']}],
  ['a06','A','A, E, I, O, U','A E I O U',{vowels:['a','e','i','o','u']}],
  ['a07','A','Lama','La la …',{onsets:['l']}],
  ['a08','A','Toto und Tila','Ta ta …',{onsets:['t']}],
  ['a09','A','Ri ra ru','Ri ri …',{onsets:['r']}],
  ['a10','A','Sumsumsum','Sa sa …',{onsets:['s']}],
  ['a11','A','Wito','Wi wi …',{onsets:['w']}],
  ['a12','A','Di del du del da del','Da da …, del',{onsets:['d'],blocks:['del']}],
  ['a13','A','Sina und Lena','Na na …, len, sen',{onsets:['n'],blocks:['len','sen']}],
  ['a14','A','Wir essen in der Schule','Sch sch, ü',{onsets:['sch'],vowels:['ü']}],
  ['a15','A','Im Winter','Wiederholen',{}],
  ['a16','A','Wir reimen','Ei ei',{vowels:['ei']}],
  ['a17','A','In der Schule','K k, ck',{onsets:['k'],endings:['ck']}],
  ['a18','A','Am Abend','B b, ä',{onsets:['b'],vowels:['ä']}],
  ['a19','A','Auf Grönland','F f, Au au',{onsets:['f'],vowels:['au']}],
  ['b01','B','Grillfest im Garten','G g, h',{onsets:['g','h']}],
  ['b02','B','Im Riesenland','ie, ö',{vowels:['ie','ö']}],
  ['b03','B','Panne','P p, Pf pf',{onsets:['p','pf']}],
  ['b04','B','Der Hase und der Igel','H h, ß',{endings:['ß']}],
  ['b05','B','Tiger in Indien','ch',{endings:['ch']}],
  ['b06','B','Ferien auf dem Bauernhof','Ä ä',{}],
  ['b07','B','Störche','St st, Sp sp',{onsets:['st','sp']}],
  ['b08','B','Im Zoo','Z z, tz',{onsets:['z'],endings:['tz']}],
  ['b09','B','Türkisches Tanzlied','Ai ai',{vowels:['ai']}],
  ['b10','B','Lena im Rollstuhl','ng, nk',{endings:['ng','nk']}],
  ['b11','B','Der Jaguar','J j',{onsets:['j']}],
  ['b12','B','Eulen jagen in der Nacht','Eu eu',{vowels:['eu']}],
  ['b13','B','Das Vogelnest','V v',{onsets:['v']}],
  ['b14','B','Was Tiere träumen','äu',{vowels:['äu']}],
  ['b15','B','Die Frösche quaken','Qu qu',{onsets:['qu']}],
  ['b16','B','Im Zirkus','C c, Y y',{onsets:['c'],blocks:['y']}],
  ['b17','B','Hexe Trixi','X x, chs',{onsets:['x'],endings:['chs']}],
  ['b18','B','Mit Sprache spielen','Wiederholen',{}],
  ['b19','B','Der kleine Eisbär','Wiederholen',{}],
  ['b20','B','Die Bremer Stadtmusikanten','Wiederholen',{}],
  ['b21','B','Wuses Brotchips','Wiederholen',{}],
];

const blocks=new Set(), vowels=new Set(), onsets=new Set(), endings=new Set();
export const LEVELS=Object.freeze([
  Object.freeze({id:'previous',part:'',number:0,title:'Bisherige Auswahl',introduction:'Mo, Mi, Mu, i, o, u, a',syllables:Object.freeze(SYLLABLES.map(s=>s.toLowerCase()))}),
  ...chapters.map(([id,part,title,introduction,added],index)=>{
    for(const s of added.blocks||[])blocks.add(s);
    for(const s of added.vowels||[])vowels.add(s);
    for(const s of added.onsets||[])onsets.add(s);
    for(const s of added.endings||[])endings.add(s);
    const pool=new Set([...blocks,...vowels]);
    for(const onset of onsets)for(const vowel of vowels){
      // qu already includes u; avoid quu and awkward umlaut/diphthong combinations.
      if(onset==='qu'&&!['a','e','i','o'].includes(vowel))continue;
      pool.add(onset+vowel);
    }
    // ck/ch/ng/nk/tz/chs and ß are endings, never invented word-initial onsets.
    for(const ending of endings)for(const vowel of vowels){
      if(vowel.length===1)pool.add(vowel+ending);
    }
    return Object.freeze({id,part,number:index+1,title,introduction,syllables:Object.freeze([...pool])});
  }),
]);
export const DEFAULT_LEVEL='previous';
const byId=new Map(LEVELS.map(level=>[level.id,level]));
export function getLevel(id){return byId.get(id)||byId.get(DEFAULT_LEVEL);}
export function normalizeSelection(input){
  const level=getLevel(input?.levelId);
  const requested=Array.isArray(input?.syllables)?new Set(input.syllables):null;
  const selected=requested?level.syllables.filter(s=>requested.has(s)):level.syllables;
  return {levelId:level.id,syllables:[...(selected.length?selected:level.syllables)]};
}
export function readSelection(storage){
  try{return normalizeSelection(JSON.parse(storage.getItem('silbengenerator.selection')));}catch{return normalizeSelection();}
}
export function saveSelection(storage,selection){
  if(!selection.syllables.length)return;
  try{storage.setItem('silbengenerator.selection',JSON.stringify(normalizeSelection(selection)));}catch{/* Optional on restricted devices. */}
}
