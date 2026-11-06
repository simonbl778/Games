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
Kontextabhängige Anfangs-, Verbindungs- und Endformen erhalten einen
zusammenhängenden Textlauf. Die Anschlüsse werden innerhalb der Schrift
gebildet, ohne zusätzliche Zeichen, Leerzeichen oder Silbenspans einzufügen.
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

Die Prüfung formt alle verfügbaren Silbenketten bis Länge fünf. Zusätzlich
prüft sie gerasterte Zwei- und Dreibuchstabenketten in zwei Größen: ein
verbundener Buchstabenkörper und getrennte Punkte für jedes kleine `i`.
Vergleichsproben decken insbesondere `Momi`, `Imo`, `Omi`, `Umo`, `imu` und `omo` ab.

Beide Schriften, die Lizenz und die Spieldateien werden lokal in Website,
Offlinecache und APK mitgeliefert. Zur Laufzeit erfolgt kein externer Fontabruf.
