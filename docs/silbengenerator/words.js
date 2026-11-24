// Eigener, bewusst begrenzter Kinderwortschatz. Keine zufällig erfundenen Namen.
// | markiert die echten Sprech-/Schreibsilben für die vorhandene Farbhilfe.
// Die Zahl ist eine Mindeststufe für die Buchstaben, keine Freigabe ungewählter Silben.
const vocabulary = {
  1: ['um'],
  2: ['im', 'Mi|mi'],
  3: ['O|mi', 'Mo|mo', 'Mi|o'],
  4: ['am', 'Ma|ma', 'Ma|mi', 'O|ma', 'Mi|a'],
  5: ['Am|me', 'Em|ma', 'Em|mi', 'Me|mo'],
  7: ['La|ma', 'Li|mo', 'li|la', 'ma|le', 'mal', 'Lamm', 'Alm', 'al|le', 'Aal', 'Aa|le', 'Al|lee', 'E|mil', 'Mi|la', 'Mi|lo', 'Lil|li', 'Le|o', 'Lo|la', 'A|li', 'Le|a', 'O|le', 'U|li'],
  8: ['Tal', 'Mut', 'mit', 'alt', 'al|te', 'malt', 'mal|te', 'Mat|te', 'Mit|te', 'Mot|te', 'To|ma|te', 'Mut|ti', 'Ot|to', 'Ti|mo', 'Ti|la', 'To|to', 'to|tal', 'Tee', 'A|tom', 'A|to|me', 'Amt', 'Me|tall', 'Me|tal|le', 'A|tem', 'at|me', 'at|met', 'at|me|te'],
  9: ['rot', 'ro|te', 'Arm', 'Ar|me', 'Tor', 'To|re', 'Turm', 'Mut|ter', 'Mo|tor', 'Ma|te|ri|al'],
  10: ['ist', 'es', 'so', 'als', 'Sa|lat', 'Sa|la|mi', 'Tas|se', 'Tas|te', 'Tas|ta|tur', 'Ras|sel', 'Ro|se', 'Som|mer', 'sum|me'],
  11: ['wir', 'was', 'wer', 'wo', 'war', 'Was|ser', 'Wol|le', 'Welt', 'Wort', 'Wor|te', 'Wet|ter', 'Wal', 'Wal|ross', 'Wal|ros|se', 'war|te', 'war|tet', 'Wil|li', 'Wil|ma'],
  12: ['da', 'der', 'das', 'du', 'Do|se', 'Da|me', 'Rad', 'Ra|di|o', 'Mo|de', 'Mo|dell', 'Mo|del|le', 'Mar|me|la|de', 'Mo|de|ra|tor'],
  13: ['in', 'an', 'und', 'den', 'dem', 'Na|se', 'Na|me', 'Na|men', 'Le|na', 'Si|na', 'le|sen', 'ler|nen', 'ren|nen', 'ma|len', 'Son|ne', 'Man|tel', 'Ton|ne', 'Tan|ne', 'En|te', 'En|ten', 'An|na', 'Ni|na', 'Ni|no', 'To|ma|ten', 'Me|lo|ne', 'Was|ser|me|lo|ne', 'Was|ser|me|lo|nen', 'To|ma|ten|sa|lat', 'Sa|lat|to|ma|te', 'Man|da|ri|ne', 'A|na|nas', 'Was|ser|ton|ne', 'Was|ser|rat|te', 'Li|mo|na|de', 'Mo|de|ra|to|ren'],
  14: ['Schu|le', 'Schü|ler', 'Schü|le|rin', 'Schü|le|rin|nen', 'Schüs|sel', 'Schüs|seln', 'Tisch', 'schon', 'Tür', 'Tü|ren', 'Tü|te', 'Tü|ten', 'mü|de', 'müs|sen', 'Schwes|ter', 'Schwes|tern', 'Schnee', 'Schlit|ten', 'Schloss', 'Schlüs|sel', 'Som|mer|schu|le'],
  16: ['Ei', 'Eis', 'Seil', 'ein', 'ei|ne', 'mein', 'mei|ne', 'dein', 'dei|ne', 'Lei|ter', 'Rei|se', 'rei|sen', 'Ei|mer', 'Rei|ter', 'Lei|ne', 'Sei|te', 'lei|se', 'A|mei|se', 'Man|da|ri|nen|eis'],
  17: ['Kind', 'Kin|der', 'Kis|te', 'Kis|sen', 'Kamm', 'Sack', 'So|cke', 'So|cken', 'We|cker', 'De|cke', 'De|cken', 'le|cker', 'Mu|sik', 'Ka|mel', 'Ka|ka|o', 'Ka|ra|mell'],
  18: ['Ball', 'Bäl|le', 'Bär', 'Bä|ren', 'Bett', 'Bet|ten', 'Bild', 'Bil|der', 'Blu|me', 'Blu|men', 'Ba|na|ne', 'Ba|na|nen', 'Bi|ber', 'Bril|le', 'Bril|len', 'But|ter', 'bit|te', 'Bi|bi', 'a|ber', 'ba|den', 'Ba|de|wan|ne', 'Ba|de|man|tel', 'Ka|ra|mell|bon|bon', 'Ba|na|nen|scha|le', 'But|ter|brot', 'Son|nen|bril|le', 'Son|nen|blu|me', 'Was|ser|ball'],
  19: ['Frau', 'Baum', 'Au|to', 'Au|tos', 'Fens|ter', 'Fe|der', 'Fe|dern', 'Fisch', 'Fi|sche', 'lau|fen', 'kau|fen', 'Au|to|rei|fen', 'Au|to|ma|ten', 'Au|to|mat', 'Fe|ri|en', 'Was|ser|fla|sche'],
  20: ['Haus', 'Hund', 'Hand', 'Ha|se', 'Ha|sen', 'Ho|se', 'Ho|sen', 'Heft', 'Hef|te', 'Ha|fen', 'Gar|ten', 'Gär|ten', 'Ga|bel', 'Gum|mi', 'Gum|mi|bär', 'Gum|mi|bä|ren', 'Ge|mü|se', 'hal|lo', 'Him|bee|re', 'Him|bee|ren', 'Erd|bee|re', 'Au|to|bahn', 'Au|to|bah|nen', 'Re|gen', 'Re|gen|schirm', 'Son|nen|schirm', 'Re|gen|bo|gen', 'Re|gen|ton|ne', 'Mu|sik|leh|re|rin', 'Mu|sik|leh|rer', 'Kin|der|gar|ten', 'Kin|der|gär|ten', 'Schu|he'],
  21: ['Bie|ne', 'Wie|se', 'Tier', 'Tie|re', 'lie|be', 'sie', 'wie', 'die', 'hier', 'Brief', 'Brie|fe', 'Lied', 'Lie|der', 'sie|ben', 'Öl', 'Ö|le', 'Löf|fel', 'Kö|nig', 'Kö|ni|gin', 'Möh|re', 'Möh|ren', 'Bö|den'],
  22: ['Pa|pa', 'Pa|pi', 'O|pa', 'O|pi', 'Pferd', 'Pfer|de', 'Pfan|ne', 'Pflau|me', 'Pflau|men', 'Pup|pe', 'Pup|pen', 'Pi|rat', 'Pi|ra|ten', 'Pa|pa|gei', 'Pa|pa|gei|en', 'Pau|se', 'Pau|sen', 'Pa|pier', 'Pa|pier|blu|me', 'Ap|fel', 'Äp|fel', 'Am|pel', 'Am|peln', 'Lam|pe', 'Lam|pen'],
  23: ['aß', 'Fuß', 'Fü|ße', 'groß', 'gro|ße', 'hei|ßen', 'heiß', 'Sü|ßig|kei|ten'],
  24: ['ich', 'mich', 'dich', 'sich', 'auch', 'noch', 'nach', 'Buch', 'Bü|cher', 'Milch', 'Dach', 'Dä|cher', 'Ku|chen', 'Kü|che', 'Kno|chen', 'Wo|che', 'Wo|chen', 'la|chen', 'ma|chen', 'su|chen', 'Gum|mi|bär|chen', 'Ka|nin|chen', 'Eich|hörn|chen', 'Kin|der|bü|cher', 'Bü|cher|re|gal', 'Bü|cher|re|ga|le'],
  26: ['Stern', 'Ster|ne', 'Stein', 'Stei|ne', 'Stuhl', 'Stüh|le', 'Stra|ße', 'Stra|ßen', 'Spa|ten', 'Spaß', 'Spiel', 'Spie|le', 'spie|len', 'Spin|ne', 'Spin|nen', 'Stift', 'Stif|te', 'Stie|fel', 'Stör|che', 'Schul|stun|de', 'Schul|stun|den'],
  27: ['Zug', 'Zü|ge', 'Zahn', 'Zäh|ne', 'Ze|bra', 'Zie|ge', 'Zie|gen', 'Kat|ze', 'Kat|zen', 'Tat|ze', 'Zoo', 'Zim|mer', 'Zi|tro|ne', 'Zau|ber', 'Po|li|zei', 'Po|li|zis|tin', 'Po|li|zis|ten', 'Zau|be|rer'],
  28: ['Mai', 'Mais', 'Kai'],
  29: ['eng', 'Ring', 'Rin|ge', 'Bank', 'Bän|ke', 'dan|ke', 'sin|gen', 'sprin|gen', 'trin|ken', 'Schmet|ter|ling', 'Schmet|ter|lin|ge', 'Schmet|ter|lings|gar|ten', 'Was|ser|lei|tung', 'Me|lo|nen|ker|ne', 'Kin|der|gar|ten|kind'],
  30: ['ja', 'Ja|cke', 'Ja|cken', 'Jun|ge', 'Jun|gen', 'Jahr', 'Jah|re', 'Ja|gu|ar', 'Jo|jo', 'Ju|li', 'Ju|ni', 'Ja|na', 'Jan', 'Jo|nas', 'Jo|han|na'],
  31: ['Eu|le', 'Eu|len', 'Eu|ro', 'Eu|ros', 'heu|te', 'Feu|er', 'Feu|er|wehr', 'Feu|er|wehr|au|to', 'A|ben|teu|er', 'A|ben|teu|er|buch', 'neun', 'neu', 'Freund', 'Freun|de', 'Freun|din', 'Freun|din|nen'],
  32: ['Va|ter', 'Vo|gel', 'Vö|gel', 'vier', 'viel', 'vie|le', 'Veil|chen'],
  33: ['Mäu|se', 'Häu|ser', 'Bäu|me', 'Träu|me', 'träu|men', 'räu|men', 'Räu|ber'],
  34: ['qua|si', 'Qual|le', 'Quel|le', 'quak', 'qua|ken', 'be|quem', 'Qua|drat', 'Qua|dra|te'],
  35: ['Ba|by', 'Ba|bys', 'Clown', 'Co|la', 'Cam|ping', 'Cent', 'Com|pu|ter', 'Yo|ga', 'Yp|si|lon'],
  36: ['Och|se', 'He|xe', 'He|xen', 'Ta|xi', 'Ta|xis', 'Fuchs', 'Füch|se', 'sechs', 'wach|sen', 'Wachs', 'Dachs', 'Dach|se', 'Max'],
};

export const WORDS = Object.freeze(Object.entries(vocabulary).flatMap(([firstLevel, spellings]) =>
  spellings.map(spelling => {
    const syllables = Object.freeze(spelling.split('|'));
    return Object.freeze({firstLevel: Number(firstLevel), text: syllables.join(''), syllables, count: syllables.length});
  })
));
