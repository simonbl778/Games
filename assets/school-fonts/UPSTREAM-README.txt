Titel: Schulausgangsschriften
Autor: Walter Entenmann
E-mail: walter.entenmann@t-online.de
Datum: 27.05.2021
Lizenz: free lppl 
        "This material is subject to the LaTeX Projekt Public License".
Paket-Name: schulschriften
Version: 5
Last update: 04.11.2012, 07.11.2012, 14.11.2012, 26.06.2014, 16.09.2014,
30.11.2014, 30.11.2014
Aenderungen in Version 2:
Bei allen Fonts wurden fette Schriften hinzugefuegt. 
Es gibt jetzt auch die Font Series (weight class): sb, bx, eb, ub
fuer semi bold, bold, extra bold, ultra bold, die z.B. fuer bx und slanted mit
\usefont{T1}{<font>}{bx}{sl} in einem LaTeX-Dokument verwendet werden koennen.
Die neue Version ist kompatibel, d.h. alles Bisherige laeuft auch mit 
Version 2 unveraendert. Version 2 bietet nur zusaetzliche Moeglichkeiten.
Die Bezeichnung 'bx' wurde gewaehlt, weil es beim Font wesu bereits eine
Font Series 'b' (Bandzugfeder) gibt.
Aenderungen in Version 3:
Bei der Lateinischen Ausgangsschrift LA wurde das 'e' als echtes
Schleifchen-e ausgefuehrt und der Schnittpunkt der Oberschleifen
etwas tiefer gelegt. Die Aenderungen betreffen nur die Files
wela14_def.mf, wela14_kl.mf und wela14_sz.mf sowie die Dokumentation
und die Fonttabelle. Die Version ist voll kompatibel.
Aenderungen in Version 4:
Der Font fuer die Schulausgangsschrift SAS (wesa) wurde 
nach den Originalvorlagen von Renate Tost (*1937), Dresden,  aus dem Jahr 1968
ueberarbeitet, um den speziellen Duktus der Schrift besser zur
Geltung zu bringen.
Bei allen Schriften wurden die Ziffern, Frage- und Rufezeichen und
Klammern in Form und Groesse gemaess den Originalvorlagen
neu gestaltet. Ausserdem wurden die  Sonderzeichen wie $, #, usw. 
systematisch vereinheitlicht.
Aenderungen in Version 5:
Hinweis von Herrn Bernd Pfitzinger: arithmetic overflow in wesa bei
fontsize 212pt.In  wesa14_def.mf, Zeile 433 und weva14_def.mf, Zeile 385
Division vorgezogen.
Kurzbeschreibung: 
Die in METAFONT implementierten Schrift-Fonts ermoeglichen das
verbundene Schreiben von Texten in den an deutschen Schulen
in der Vergangenheit und heute fuer den
Schreibunterricht zugelassenen
deutschen und lateinischen Schulausgangsschriften.
Dazu gehoeren 
die Suetterlinschrift                (1911), (SU)  <font>=wesu 
die Deutsche Normalschrift           (1941), (DN)  <font>=wedn
die lateinische Ausagangsschrift     (1953), (LA)  <font>=wela
die Schulausgangsschrift  (1968, ehem. DDR), (SAS) <font>=wesa 
und die Vereinfachte Ausgangsschrift (1972), (VA)  <font>=weva. 

Wenn man das Paket mit
              unzip schulschriften.zip
im aktuellen Arbeitsverzeichnis entpackt,
wird ein Unterverzeichnis schulschriften geoeffnet,
das  dieses README-File und die weiteren Unterverzeichnisse 
doc, tex, source  enthaelt.

doc/
Die Dokumentation findet man im Unterverzeichnis doc 
als pdf-File und als LaTeX-File. Das pdf-Dokument kann man dort
mit dem Acrobat-Reader wie folgt lesen
                  acroread schulschriften.pdf

tex/
Im Unterverzeichnis tex befinden sich 
die fuer alle Fonts gemeinsamen Stil- und Beispielfiles
schulschriften_lin.sty, _ltx.sty, _xpl.tex und _ltx.tex.
In den weiteren Unterverzeichnissen
wesu, wedn, wela, wesa, weva liegen fuer jeden Font 
das Fontdefinitionsfile t1<font>.fd,
das Fontbefehlsdefinitionsfile <font>.sty und die
Fonttabelle <font>_fonttabelle.eps.

source/
Die MetaFont-Quellfiles  befinden sich im Unterverzeichnis source.
Dieses ist weiter gegliedert in die  Unterverzeichnisse 
wesu, wedn, wela, wesa, weva, 
die die *.mf-Files fuer die einzelnen Fonts enthalten.

Das weitere Vorgehen ist in der Dokumentation beschrieben.
Hier nur eine Kurzanleitung:
Damit man die Fonts in LaTeX-Dokumenten im ganzen Heimatverzeichnis
benuetzen kann, muss man sicherstellen, dass die benoetigten Quellfiles etc.
bei der latex- und dvips-Bearbeitung gefunden werden. 
Deshalb ist es sehr zweckmaessig, die Files des Pakets
in einen lokalen texmf-Baum im Home-Directory zu verschieben.
Dieser sollte folgende Struktur haben:
~/texmf/tex/latex
       /fonts/source/
       /doc/

In diesem ~/texmf-Baum duerfen die Unterverzeichnisse schulschriften
noch nicht existieren. Im Falle eines Updates muss man diese 
gegebenenfalls loeschen, bevor man die Files dorthin kopiert.

Zum Kopieren der Files geht man in das Unterverzeichnis schulschriften, 
das beim Entpacken des Pakets entstanden ist, und gibt die Kommandos:
cp -r tex ~/texmf/tex/latex/schulschriften
cp -r source ~/texmf/fonts/source/schulschriften
cp doc/*.pdf ~/texmf/doc
cp doc/*.tex ~/texmf/tex/latex/schulschriften

Zum Abschluss gibt man noch das Kommando:
sudo mktexlsr ~/texmf
(in MacOS befindet sich das Directory texmf in ~/Library/texmf)

Damit ist die Installation beendet.

Die Dokumentation erhaelt man jetzt mit dem Befehl
texdoc schulschriften.


Fuer Hinweise auf Fehler und fuer Verbesserungsvorschlaege waere ich
sehr dankbar.

end-of-file
