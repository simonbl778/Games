# Quellen für die Schulschriften

Die Ordner `wela` und `weva` enthalten unveränderte METAFONT-Quelldateien aus
Walter Entenmanns **schulschriften**, Version 5 (CTAN, 2021).
Originalhinweise stehen in `UPSTREAM-README.txt`.

Quelle: https://ctan.org/pkg/schulschriften
Archiv: https://ctan.math.illinois.edu/fonts/schulschriften.zip
Lizenz: LaTeX Project Public License; vollständiger Text auch unter
`docs/silbengenerator/fonts/LPPL.txt`.

Der Build übernimmt die Buchstabenkörper und erzeugt daraus die neuen,
umbenannten Schriften **SilbenLA** und **SilbenVA**, mit OpenType-Anschlüssen
und Anfangs-/Endformen für den Zeichenvorrat des Silbengenerators.
Die Dateien der Originalschriften werden nicht überschrieben.
Der Build erzeugt außerdem `school-outlines.js` aus denselben TTF-Konturen.
Die Spielanzeige färbt die Buchstabenkörper einschließlich Überhängen.
Gemeinsame Verbindungsschwünge wechseln an Silbengrenzen auf halber Bogenlänge die Farbe.

Mit installiertem MetaPost inklusive `mfplain.mp` und den Python-Abhängigkeiten:

    python3 -m pip install -r assets/school-fonts/requirements.txt
    python3 scripts/build-school-fonts.py
    python3 scripts/check-school-fonts.py
    python3 scripts/check-app-styles.py

Falls `mfplain.mp` nicht im normalen MetaPost-Suchpfad liegt, kann sein Ordner
über `--metapost-base` angegeben werden. Das Spiel benötigt diese Werkzeuge
nicht; es verwendet die fertig eingebundenen TTF-Dateien offline.

Die App-Stilprüfung lässt sich auch direkt mit einer APK ausführen:

    python3 scripts/check-app-styles.py --apk downloads/Silbengenerator-1.3.3.apk
