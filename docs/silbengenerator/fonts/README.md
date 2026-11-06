# Schulschreibschrift

Die lokal eingebundene Schrift **Playwrite DE LA** bildet die deutsche
**Lateinische Ausgangsschrift** mit verbundenen Buchstaben ab.
Sie stammt von TypeTogether, Veronika Burian und José Scaglione.

- Offizielle Quelle: https://github.com/google/fonts/tree/main/ofl/playwritedela
- Upstream: https://github.com/TypeTogether/Playwrite
- Unveränderte variable TTF-Datei, Gewichte 100–400; lokal nur umbenannt.
- Lizenz: SIL Open Font License 1.1; vollständiger Text in OFL.txt.
- Quell-Blob: 50d6842e19a59ad446d6b5e6838c78bb89064310.

Die Schrift bleibt in der Website, im Offlinecache und im APK enthalten.
Es werden keine Schriftdateien von Google oder anderen externen Diensten
zur Laufzeit geladen. Kontextabhängige Alternativen, Ligaturen und Kerning
müssen eingeschaltet bleiben, damit die Buchstaben sauber verbunden sind.
Zusätzlich werden die Schulvarianten ausdrücklich eingeschaltet:
`ss05` für geschwungene Anstriche, `ss07` für kleine Schleifen am `o` und
`ss19` für Schreibschrift-Großbuchstaben. `ss20` bleibt ausgeschaltet,
damit dekorative Großbuchstaben nicht die Schulformen ersetzen.
Dadurch verwendet `omo` die passenden Anfangs- und Endformen `o.mlp.ini`
und `o.mlp.fin`; `M`, `I` und `O` erhalten die eigentlichen Schreibschriftformen.
Die Farbhilfe malt Schreibschrift auf einem durchgehenden Textlauf an;
sie zerlegt die Schreibschrift nicht in getrennte Silben-Spans.

Diese Auswahl ist die Lateinische Ausgangsschrift. Schulen können stattdessen
andere Modelle wie die Vereinfachte Ausgangsschrift oder Schulausgangsschrift
verwenden.
