# Schulschriften: LA und VA

Die App bietet **Druckschrift** (Standard), **Lateinische Ausgangsschrift** (LA)
und **Vereinfachte Ausgangsschrift** (VA) als getrennte Auswahlmöglichkeiten.
Die lokalen Schriften `SilbenLA.ttf` und `SilbenVA.ttf` bilden die acht vom Spiel
verwendeten Zeichen `M I O U m i o u` sowie Leerzeichen ab.

## Schriftmodelle und Vorlagen

- [Lateinische Ausgangsschrift und Alphabet](https://de.wikipedia.org/wiki/Ausgangsschrift#Lateinische_Ausgangsschrift)
- [Vereinfachte Ausgangsschrift und Alphabet](https://de.wikipedia.org/wiki/Vereinfachte_Ausgangsschrift)
- [Elterninfo des Kultusministeriums Baden-Württemberg, Seiten 16–17](https://km.baden-wuerttemberg.de/fileadmin/redaktion/m-km/intern/PDF/Publikationen/Grundschule/Elterninfo_2025_bf_web.pdf)

Baden-Württemberg sieht mehrere Schriftmodelle vor. Das ist keine Zulassung
einer konkreten digitalen Schriftdatei. Die LA hat unter anderem den Anstrich
am kleinen `i`, `u` und `o` sowie andere Großbuchstaben als die VA. Die VA-Tafel
zeigt das kleine `i` ohne zusätzlichen vorgeschalteten Anstrich; diese Form
bleibt in der VA-Auswahl erhalten.

Die Buchstabenkörper stammen aus Walter Entenmanns Paket **schulschriften**:
`wela` (LA) und `weva` (VA), jeweils mit der vorgesehenen Schrägstellung.
Die unveränderten Zeichenprogramme sind im Repository unter
`assets/school-fonts/` enthalten. Es werden keine Schriften aus kommerziellen
Arbeitsblatt-PDFs extrahiert und keine dekorativen Ersatzformen verwendet.

Für die App wurden daraus neue, umbenannte OpenType-Schriften erzeugt.
Kontextabhängige Anfangs-, Verbindungs- und Endformen halten die Kette verbunden.
Die Anschlusskurven folgen den Tangenten der benachbarten Striche. Das innere
LA-`m` übernimmt den Aufstrich des vorherigen Buchstabens an seinem ersten Bogen;
der separate Anfangshaken entfällt dort. So entsteht kein waagerechter Absatz.

Die Spielanzeige verwendet exakt diese kontextabhängigen Schriftkonturen als
SVG-Pfade. Jeder Buchstabenkörper erhält die eigene Silbenfarbe.
Auch ein schräger Überhang behält die Farbe seiner tatsächlichen Silbe.
Es gibt keine senkrechten Farbverlaufsgrenzen, Buchstaben-Clippingmasken oder
getrennt geformten Silbentexte. Ein-/Ausschalten der Farbhilfe verändert keine
Form, Position oder Verbindung. Der zugängliche Text und die Ansage des
Antipp-Buttons bleiben die ursprüngliche Silbenkette.

**Auf Nutzerwunsch sind auch die Anfangsgroßbuchstaben verbunden.** Bei VA
werden dafür ausgehende Anschlüsse an `I` und `O` ergänzt, die im Grundmodell
üblicherweise abgesetzt bleiben. Ihre Buchstabenkörper werden nicht verändert.

## Quelle, Lizenz und Nachbau

- Originalpaket: https://ctan.org/pkg/schulschriften
- Download: https://ctan.math.illinois.edu/fonts/schulschriften.zip
- Autor der ursprünglichen Zeichenprogramme: Walter Entenmann.
- Lizenz für die Originalprogramme und die abgeleiteten Schriften:
  LaTeX Project Public License 1.3c oder neuer, vollständig in `LPPL.txt`.
- Anpassung: Games-Projekt, 2026; eigene Namen `SilbenLA` und `SilbenVA`.
- Build: `scripts/build-school-fonts.py`; benötigt MetaPost mit `mfplain.mp`
  und die Python-Abhängigkeiten aus `assets/school-fonts/requirements.txt`.
- Schriftprüfung: `python3 scripts/check-school-fonts.py`.

Die Prüfung vergleicht die Glyphenauswahl und Abstände aller verfügbaren
Silbenketten bis Länge fünf mit HarfBuzz und die SVG-Konturen mit der TTF-Datei. Zusätzlich
prüft sie gerasterte Zwei- und Dreibuchstabenketten in zwei Größen: ein
verbundener Buchstabenkörper und getrennte Punkte für jedes kleine `i`.
Vergleichsproben decken insbesondere `mimu`, `Momi`, `Imo`, `Omi`, `Umo`, `imu` und `omo` ab.

Beide Schriften, die Lizenz und die Spieldateien werden lokal in Website,
Offlinecache und APK mitgeliefert. Zur Laufzeit erfolgt kein externer Fontabruf.

## App-Darstellung ab Version 1.3.2

Die verwendeten LA-/VA-Konturen wurden erneut mit den verlinkten Wiki-Tafeln
verglichen und entsprechen der bestätigten Schriftprobe. Die Spielgrafik wird
von den Symbol-Stilen der Schaltflächen getrennt: keine zusätzlich gezeichneten
Konturlinien und keine Verfärbung durch geerbtes `stroke: currentColor`.
Die Druckschrift verwendet ebenfalls die rote zweite und vierte Silbe.

`scripts/check-app-styles.py` prüft dafür die echten App-Stilregeln zusammen mit
den von `renderChain` erzeugten Elementen. Die Prüfung kann mit `--apk` direkt
die HTML-, CSS- und Darstellungsdateien einer APK verwenden. Sie reproduziert
die Stilprobleme der Ausgabe 1.3.1. Das ist eine CSS-Integrationsprüfung;
ein Test auf einem physischen Android-Gerät wird dadurch nicht ersetzt.
Die Startseite zeigt die jeweilige Version an; der APK-Build vergleicht diese
Anzeige mit dem Android-Manifest.

## o-Anschlüsse und mittige Farbgrenzen ab Version 1.3.3

Der Eintritt in das kleine `o` liegt auf dessen äußerem oberen linken Bogen.
Der Anschluss berücksichtigt die Tangente und hält den Innenraum frei, auch
nach dem großen `U`. Der Abstand wird nötigenfalls dafür angepasst.

Der native Ausgangsschwung und die ergänzte Anschlusskurve bilden gemeinsam
eine Verbindung. Ihre Bogenlänge wird berechnet; die Farbgrenze liegt exakt
auf halber Länge und quer zur dortigen Tangente. Die zweite Hälfte übernimmt
die Farbe der folgenden Silbe. Innerhalb derselben Silbe bleibt die Farbe gleich.
Der vollständige Originalpfad liegt darunter; nur der Verbindungsteil wird
übermalt. So entstehen keine herausgeschnittenen Körper, fremd gefärbten
Überhänge oder senkrechten Farbgrenzen über die gesamte Schrift.

Die Schriftprüfung kontrolliert zusätzlich den freien Innenraum beim Anschluss
`Uo` und dass die übermalte Verbindung innerhalb der tatsächlichen Kontur liegt.
Die Vergleichsprobe enthält `u|i|o`, `U|o|mi`, `U|o` und `mi|mu` in LA und VA.
