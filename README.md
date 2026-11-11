# Games · Kleine Lernspiele

Zwei Lernspiele für Kinder, als installierbare Web-Apps für Android gebaut.
Beide verwenden dieselben ruhigen Farben, große Bedienelemente und einen eigenen Offlinecache.
Der Code wird in diesem Repository gepflegt.

| Spiel | Übung | Ausrichtung | Spieladresse über ChatGPT Sites |
| --- | --- | --- | --- |
| **Silbengenerator** | Silbenketten lesen | Querformat | https://silbengenerator-simonbl778.simon-bl778.chatgpt.site |
| **Blitzblickzahlen** | Mengen von 1–10 auf einen Blick erkennen | Hochformat | https://blitzblickzahlen-simonbl778.simon-bl778.chatgpt.site/blitzblickzahlen/ |

Die gemeinsame Startseite unter https://blitzblickzahlen-simonbl778.simon-bl778.chatgpt.site/ bietet die Auswahl beider Spiele. Der Zugriff erfolgt wie beim bisherigen Silbengenerator über das eigene ChatGPT-Konto. Für diese Spieladressen muss GitHub Pages nicht aktiviert werden.

## Silbengenerator

Eine große Silbenkette lesen, antippen und weiterlesen.

![Silbengenerator im Handy-Querformat](screenshots/silbengenerator-20261028.jpg)

## Spielen

**Eigenständige Silbengenerator-App ohne ChatGPT-Anmeldung:**
[APK direkt über die Spielseite herunterladen](https://silbengenerator-simonbl778.simon-bl778.chatgpt.site/downloads/silbengenerator-1.5.1.apk) ·
[GitHub-Download](https://github.com/simonbl778/Games/raw/refs/heads/main/docs/downloads/silbengenerator-1.5.1.apk).
Diese Datei lässt sich auch auf OneDrive ablegen und per Link weitergeben.
Die App funktioniert ab Android 8 und von Anfang an vollständig offline.
Version 1.5.1 lässt sich mit derselben Signatur über 1.1.x, 1.2.x, 1.3.x und 1.4.x installieren. Die Druckschrift verwendet jetzt die lokal eingebundene Schulschrift **Fibel Nord** von Peter Wiegel. Das kleine **a** hat den runden Bauch und geraden rechten Strich aus den Fotovorlagen; auch die übrigen Druckbuchstaben verwenden dieselbe Schrift. Silbenvorschau, Auswahl und Schriftprobe sind entsprechend angepasst. Unten auf der Startseite steht zur Kontrolle **Version 1.5.1**.

Beim Wechsel von einer alten Silbengenerator-APK (1.0.x) muss die alte App einmal deinstalliert werden: Version 1.1.0 hat einen neuen Signierschlüssel, weil der frühere private Schlüssel nach dem Neustart der Build-Umgebung nicht mehr vorlag. Dabei geht nur die letzte Silben-Auswahl verloren; es gibt keine gespeicherten Lernstände. Den neuen privaten Schlüssel für künftige Updates getrennt vom öffentlichen Repository aufbewahren.
[Installation und Weitergabe](downloads/README.md) · [Android-Quellcode und Build](android/README.md)

**Silbengenerator öffnen:** https://silbengenerator-simonbl778.simon-bl778.chatgpt.site

**Blitzblickzahlen öffnen:** https://blitzblickzahlen-simonbl778.simon-bl778.chatgpt.site/blitzblickzahlen/

Beide Spiele bieten auf ihrer Auswahlseite **Aufs Handy** zum Installieren. Nach dem vollständigen Laden zeigt **Offline bereit** an, dass das jeweilige Spiel ohne Internet genutzt werden kann. GitHub Pages bleibt eine optionale weitere Bereitstellung.

## Auf einem Android-Handy starten

1. Die veröffentlichte Spieladresse in **Google Chrome** öffnen.
2. Eine Höchstzahl von **1 bis 5** wählen und **Lesen starten** antippen.
3. Das Handy quer halten. Die App fordert beim Start Vollbild und Querformat an, soweit der Browser es erlaubt.
4. Die große Silbenkette antippen: Die nächste Kette erscheint. **Ändern** führt zur Auswahl zurück.

Für diese Browser-Installation werden keine APK, kein Android Studio, keine Entwickleroptionen und kein Play-Store-Eintrag benötigt. Blitzblickzahlen gibt es zusätzlich als eigenständige APK zum Herunterladen und Teilen.

### Wie eine App installieren

In Chrome das Dreipunkt-Menü **⋮** öffnen und **Installieren und Verknüpfung erstellen → Installieren** auswählen. Je nach Chrome-Version heißt der Eintrag **Zum Startbildschirm hinzufügen → Installieren**. Das Spiel hat dafür auch die Schaltfläche **Aufs Handy**.

Nach der Installation über das eigene App-Symbol starten. Sobald auf der Auswahlseite **Offline bereit** angezeigt wird, sind alle notwendigen Spieldateien zwischengespeichert. Von diesem Gerät aus funktioniert das Spiel dann auch ohne Internet. Der Browser kann diese Daten entfernen, etwa wenn Website-Daten gelöscht werden. In diesem Fall einmal mit Internet neu öffnen.

Die Browseransicht in einer anderen App kann Installieren, Vollbild oder Drehen einschränken. In diesem Fall den Spiel-Link direkt in Chrome öffnen. Falls sich der Bildschirm nicht automatisch dreht, Androids automatische Drehung einschalten und das Handy drehen.

## Spielregeln

- Verfügbare Bausteine: **Mo, Mi, Mu, i, o, u, a**.
- Die gewählte Zahl ist eine **Höchstzahl**, keine feste Kettenlänge. Bei `1` erscheint immer eine Silbe, bei `2` zufällig eine oder zwei. Bei `3` entstehen Ketten aus zwei oder drei, bei `4` aus drei oder vier und bei `5` aus vier oder fünf Bausteinen.
- Jeder einzelne Vokal zählt als eine Silbe. `iou` besteht damit aus drei Bausteinen.
- Jeder Baustein kann innerhalb derselben Kette mehrfach vorkommen.
- Vor dem Start lassen sich **Druckschrift**, **Lateinische Ausgangsschrift (LA)** oder **Vereinfachte Ausgangsschrift (VA)** wählen. Druckschrift ist vorausgewählt. Beide Schulschriften sind lokal und offline eingebunden; Anstriche, Großbuchstaben und Anschlüsse folgen dem jeweiligen Modell. Auch Anfangsgroßbuchstaben sind verbunden. Quellen und modellabhängige Besonderheiten stehen in [der Schriftdokumentation](docs/silbengenerator/fonts/README.md).
- Gleiche Vokale direkt an einer Silbengrenze, etwa `oo`, `ii`, `uu`, `Moo` oder `Muu`, erscheinen nur als sehr seltene Ausnahme. 99 von 100 vorgeschlagenen gleichen Vokalgrenzen werden durch einen passenden anderen Baustein ersetzt.
- **Silben dezent einfärben** ist standardmäßig eingeschaltet und lässt sich abwählen. Die erste, dritte und fünfte Silbe erscheinen dunkelgrün, die zweite und vierte in gedämpftem, gut lesbarem Rot. Die tatsächlichen Silbengrenzen bleiben ohne zusätzliche Abstände erkennbar, auch bei verbundenen Schreibschriften. Beim erneuten Öffnen gelten wieder Druckschrift und eingeschaltete Farbhilfe; innerhalb einer Partie bleiben Änderungen erhalten.
- Nur der **erste Buchstabe der gesamten Kette** wird zufällig groß- oder kleingeschrieben. Alle weiteren Buchstaben bleiben klein: zum Beispiel `Momiu` oder `momiu`, aber nicht `MoMiU`.
- Jede neue sichtbare Anzeige unterscheidet sich von der unmittelbar vorherigen.
- Die App zeigt beim erneuten Öffnen zuerst die Auswahl. Die zuletzt verwendete Höchstzahl ist lediglich vorausgewählt.
- Die Schriftgröße passt sich an die Kettenlänge und den verfügbaren Platz an. Die Kette bleibt in einer Zeile.

Im Silbengenerator gibt es keinen Zeitdruck, keine Punkte, keine Werbung und keine Spielerkonten. Ein leiser, abschaltbarer Klang begleitet bestätigte Ketten. Das Spiel selbst sendet keine Lern- oder Nutzungsdaten. Es speichert lokal nur die letzte Auswahl und Lernstufe und die Dateien für den Offlinebetrieb; das Hosting hat seine üblichen technischen Zugriffs- und ggf. Anmeldedaten.

## Blitzblickzahlen

Ein Blitzblick-Spiel für Erstklässler: schwarze Punkte auf einem weißen Zehnerfeld kurz anschauen und die Anzahl wählen, sobald sie erkannt wurde.

![Blitzblickzahlen im Handy-Hochformat](screenshots/blitzblickzahlen-spiel.png)

1. Die Spieladresse in Chrome öffnen und eine der zehn Stufen wählen.
2. **Los geht’s** antippen und das Handy hoch halten. Die App fordert Vollbild und Hochformat an, soweit der Browser es erlaubt.
3. Nur vor dem ersten Rätsel einer Partie zählt das Spiel **3–2–1** herunter. Danach erscheint das Zahlbild. Das Feld wird zeilenweise von oben links nach unten rechts gefüllt: erst beide Punkte der obersten Reihe, dann die nächste Reihe. Bei ungeraden Zahlen steht der letzte Punkt links. Die Zahl selbst wird nicht verraten.
4. Die Anzahl auf den Telefontasten **1–9** oder auf der mittigen Taste **10** wählen: bereits während der Punkteanzeige oder danach. Eine frühe Antwort blendet das Feld sofort aus und beendet die Frage. Ohne Antwort verschwindet es nach der gewählten Zeit; die Tasten bleiben danach frei. Zum Antworten gibt es keine Zeitbegrenzung.
5. Richtig: **+1 Punkt**, weicher, glockenartiger „Bling“-Ton und lächelndes Gesicht. Falsch: **−5 Punkte** (höchstens bis null), kurzer absteigender „Zonk“-Ton, Daumen nach unten und die richtige Anzahl. Ein Fehler bei 15 Punkten führt zu 10 Punkten. Nach der kurzen Rückmeldung geht es direkt mit dem nächsten Zahlbild weiter. **Ton aus** schaltet alle Rückmeldetöne stumm. Bei der nächsten Aufgabe sehen alle Zahlentasten wieder gleich aus.
6. Bei **40 Punkten** gibt es einen Pokal, Konfetti und eine fröhliche Siegermelodie mit aufsteigenden Glöckchen und einem Dur-Akkord. Danach erneut spielen oder die Stufe wechseln.

| Stufe | Sichtbare Dauer |
| --- | --- |
| 1 · ganz leicht | 5 s |
| 2 | 4 s |
| 3 | 3 s |
| 4 | 2,5 s |
| 5 | 2 s |
| 6 | 1,5 s |
| 7 | 1 s |
| 8 | 0,7 s |
| 9 | 0,5 s |
| 10 · ganz schwer | 0,3 s |

Jede Zahl ist anfangs gleich wahrscheinlich. Die unmittelbar vorherige Zahl bleibt bei der nächsten Aufgabe immer ausgeschlossen: Zwischen zwei gleichen Karten liegt mindestens eine andere, auch nach einem Fehler. Falsche Antworten erhöhen weiterhin die Gewichtung der **gesuchten** Zahl. Richtige Antworten senken diesen Fehlerzuschlag allmählich wieder.

Zusätzlich misst das Spiel im Hintergrund die aktive Zeit vom ersten sichtbaren Punktebild bis zur Antwort, auch wenn die Punkte inzwischen verdeckt sind. Countdown, Rückmeldungen und Pausen zählen nicht mit. Pro Zahl werden die letzten fünf Antwortzeiten mit den Durchschnittszeiten der anderen bereits geübten Zahlen verglichen. Überdurchschnittlich langsame Karten kommen häufiger vor; schnellere Antworten senken den Zeitzuschlag wieder. Die kombinierte Gewichtung aus Fehlern und Zeit ist auf das Fünffache begrenzt, alle anderen Zahlen bleiben möglich. Extreme Zeitwerte werden für diese Gewichtung begrenzt; beim Antworten gibt es weiterhin kein Zeitlimit.

Diese Auswertung, die Fehler und die Punkte gelten nur für die aktuelle Partie und bleiben im Arbeitsspeicher. Es werden keine Lösungszeiten übertragen oder dauerhaft gespeichert. **Spiel beenden** führt jederzeit zur Schwierigkeitsauswahl zurück und stoppt die Partie samt Ton. **Noch einmal spielen** oder ein Neuladen beginnen ebenfalls eine neue Session. Nur die letzte Stufe und die Toneinstellung bleiben lokal gespeichert.

Beim App-Wechsel wird das Spiel angehalten. Nach **Weiter geht’s** wird ein unterbrochenes Zahlbild erneut für die volle Dauer gezeigt. Eine bereits offene Antwort bleibt offen. Versteckte Zeit zählt nicht als Fehler. **Ton an/aus** schaltet die Melodien um. Am Computer entsprechen die Tasten `1`–`9` den Zahlen, `0` steht für `10`.

Installation und Offlinebetrieb funktionieren wie beim Silbengenerator über **Aufs Handy**. Jedes Spiel hat ein eigenes Symbol und einen eigenen Service-Worker-Bereich; die Offlinecaches beeinflussen sich nicht. Töne werden direkt im Browser erzeugt und funktionieren ebenfalls offline. Es gibt keine Werbung, Konten oder Übertragung von Lerndaten. Die tatsächliche Installation, Ausrichtungssperre und Tonwiedergabe bitte zusätzlich auf dem Android-Zielgerät prüfen.

Die neuen Dateien stehen in [`docs/blitzblickzahlen/`](docs/blitzblickzahlen/): `game.js` enthält Zeitstufen, Zahlbilder, Fehlergewichtung und Spielende; `app.js` steuert den Ablauf und die Handyfunktionen; `audio.js` erzeugt die Melodien. Die Spielregeln sind in [`tests/blitzblickzahlen.test.mjs`](tests/blitzblickzahlen.test.mjs) geprüft.

### APK herunterladen und teilen

Die Web-App ist auf Version **1.2.0** mit Zeitgewichtung und 40 Punkten aktualisiert. Die angebotene APK bleibt vorerst **1.1.0** mit 30 Punkten und der bisherigen Auswahlregel. Für ein darüber installierbares APK-Update wird der private Signaturschlüssel aus dem früheren Arbeitsbereich benötigt; er ist im aktuellen Arbeitsbereich nicht vorhanden. Die Browserinstallation über **Aufs Handy** verwendet bereits die neue Web-Version.

Im Spiel **APK 1.1.0** wählen oder die [APK direkt von GitHub](https://github.com/simonbl778/Games/raw/refs/heads/main/docs/downloads/blitzblickzahlen-1.1.0.apk) herunterladen. Wie beim Silbengenerator gibt es auch eine [ZIP-Datei mit APK und Installationsanleitung](https://raw.githubusercontent.com/simonbl778/Games/refs/heads/main/docs/downloads/Blitzblickzahlen-Android-1.1.0.zip). ZIP auf dem Handy entpacken und die enthaltene APK öffnen und installieren. Die Dateien liegen unter [`docs/downloads/`](docs/downloads/). Die App bringt alle Spieldateien mit und braucht weder Internet noch eine ChatGPT-Anmeldung. Über **App teilen** in der installierten App lässt sich genau diese APK an andere Handys weitergeben. Voraussetzung ist Android 8.0 oder neuer mit aktuellem Android System WebView.

Quellcode, Build-Befehl und Hinweise für zukünftige signierte Updates stehen in [`android/blitzblickzahlen/README.md`](android/blitzblickzahlen/README.md). Die APK wird zusammen mit einer SHA-256-Prüfsumme unter `docs/downloads/` ausgeliefert und enthält die Spiellogik ihres jeweiligen Versionsstands. Eine installierte APK wird ausschließlich durch eine neue APK aktualisiert.

## GitHub Pages optional einschalten

1. Im Repository **Games** zu **Settings → Pages** gehen.
2. Unter **Build and deployment → Source** die Option **Deploy from a branch** wählen.
3. Als Branch **main** und als Ordner **/docs** auswählen.
4. **Save** anklicken und die Veröffentlichung abwarten. GitHub nennt dafür bis zu etwa zehn Minuten.
5. Danach https://simonbl778.github.io/Games/silbengenerator/ öffnen.

Diese Veröffentlichung macht das Spiel öffentlich erreichbar. Das Repository ist bereits öffentlich. Es werden nur die statischen Dateien aus `docs/` veröffentlicht. `.nojekyll` schaltet die unnötige Jekyll-Verarbeitung aus. Für dieses Projekt sind kein eigener Build-Workflow und keine zusätzlichen Geheimnisse erforderlich.

## Silben ändern und weiterentwickeln

Die Bausteine stehen an genau einer Stelle: [`docs/silbengenerator/config.js`](docs/silbengenerator/config.js).

```js
export const SYLLABLES = Object.freeze(['Mo', 'Mi', 'Mu', 'i', 'o', 'u', 'a']);
```

Neue Bausteine dort ergänzen. Die Logik normalisiert alle Bausteine zunächst auf Kleinschreibung und behandelt jeden Listeneintrag als eine Silbe. Die erwartete Bausteinliste im entsprechenden Test bei einer absichtlichen Änderung mit anpassen.

Die auswählbare Höchstzahl bleibt 1–5. `DEFAULT_MAX_SYLLABLES` in derselben Datei bestimmt die Vorauswahl auf einem neuen Gerät.

### Dateien

| Datei | Aufgabe |
| --- | --- |
| `docs/silbengenerator/index.html` | Auswahl, Lesefläche und Installationshilfe |
| `docs/silbengenerator/styles.css` | Schriftgröße, Farben und Handyansichten |
| `docs/silbengenerator/app.js` | Bedienung, Größenanpassung, Querformat und Installation |
| `docs/silbengenerator/config.js` | Verfügbare Bausteine und Standardauswahl |
| `docs/silbengenerator/generator.js` | Zufällige Ketten und Groß-/Kleinschreibung |
| `docs/silbengenerator/typography.js` | Schriftwahl und sicheres Laden der eingebetteten Schulschrift |
| `docs/silbengenerator/fonts/` | Lokale Schulschreibschrift und vollständige Schriftlizenz |
| `docs/silbengenerator/manifest.webmanifest` | Android-Installation, Symbol und Ausrichtung |
| `docs/silbengenerator/service-worker.js` | Offlinebetrieb und Aktualisierung |
| `tests/generator.test.mjs` | Zehn Tests der Spielregeln |

### Lokal starten

Python 3 reicht für einen lokalen Webserver:

```sh
python3 -m http.server 8000 --directory docs
```

Danach `http://localhost:8000/` öffnen und ein Spiel wählen. Die HTML-Datei nicht nur per Doppelklick als `file://` öffnen: ES-Module und Service Worker benötigen einen Webserver. Für PWA-Funktionen im Internet wird HTTPS benötigt; `localhost` eignet sich zum Entwickeln. Die eigentliche Android-Drehung und Installation bitte auf einem Android-Gerät prüfen.

### Prüfen

Mit Node.js 20 oder neuer, ohne `npm install` und ohne zusätzliche Pakete:

```sh
npm test
npm run check
```

### Eine Änderung veröffentlichen

1. Gewünschte Dateien ändern und die Tests ausführen.
2. **Bei jeder Änderung an einer ausgelieferten Spieldatei** `VERSION` in der `service-worker.js` des jeweiligen Spiels erhöhen, zum Beispiel von `1.0.0` auf `1.0.1`. Sonst bleibt auf bereits installierten Geräten möglicherweise die alte Offline-Version aktiv.
3. Änderungen auf GitHub in `main` übernehmen. Die Sites-Veröffentlichung ist ein eigener Schritt; ein GitHub-Push aktualisiert sie nicht automatisch.
4. Für die gemeinsame Sites-Bereitstellung `npm run build:sites` ausführen. Das kopiert den aktuellen Inhalt aus `docs/` nach `dist/`. `.openai/hosting.json` enthält die feste Site-ID und das Ausgabeverzeichnis. Den identischen Commit mit dem Sites-Werkzeug in das zugehörige Quellen-Repository synchronisieren und als neue Site-Version samt `dist/` veröffentlichen. **Games bleibt die Quelle für Änderungen**, die Site-ID und die bestehenden Zugriffsrechte bleiben erhalten.
5. Die bisherige eigenständige Silbengenerator-Site ist eine getrennte Veröffentlichung; bei Silbenänderungen gegebenenfalls ebenfalls aktualisieren. Wenn GitHub Pages aktiviert ist, wird diese zusätzliche Bereitstellung automatisch aus `main` aktualisiert.
6. Das Spiel mit Internet erneut öffnen. Wenn **Eine neue Version ist bereit** erscheint, **Jetzt laden** antippen. Dabei wird wieder die Startauswahl angezeigt.

## Offizielle Hinweise

- [Google Chrome: Web-Apps auf Android verwenden](https://support.google.com/chrome/answer/9658361?hl=de&co=GENIE.Platform%3DAndroid)
- [GitHub: Eine Pages-Website erstellen](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [MDN: Grenzen der Orientierungssperre](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock)

Games 1.1.0 · Silbengenerator 1.5.1 · Blitzblickzahlen-Web-App 1.2.0 · 11. November 2026

## Lernstufen und Motivation ab Version 1.5.0

Die Kapitel aus der bereitgestellten Inhaltsübersicht stehen in Arbeitsheft Teil A
und Teil B zur Auswahl. Jede Stufe enthält die bisher eingeführten Laute und
Silben. Einzelne Silben lassen sich vor dem Start abwählen; für die Fotoauswahl
beispielsweise in „Mama“ nur **ma** und **a** aktiviert lassen. Neue Kombinationen
werden aus bekannten Lauten gebildet, keine Buchaufgaben oder Kapiteltexte kopiert.
„Bisherige Auswahl“ erhält die vertrauten Bausteine der älteren Version.

Stufe und eigene Auswahl werden sofort auf dem Gerät gespeichert. Links steht
die Zahl bereits bestätigter Silbenketten, rechts die aktive Übungszeit. Die erste
angezeigte Aufgabe zählt erst beim Weiterklicken als gelesen. Einstellungen und
Hintergrundzeit werden nicht mitgezählt; „Lesen starten“ beginnt eine neue Runde.
Der kurze Klang wird ohne Netzabruf erzeugt und lässt sich vor dem Start abschalten.

Die erweiterten LA-/VA-Schriften enthalten auch die späteren Buchstaben, Umlaute,
ß und Lautverbindungen. Die Originalformen kommen weiterhin aus `schulschriften`.
Die schon bestätigten Zehn-Buchstaben-Ketten behalten ihre bisherigen Konturen.

Zusätzliche Integrationsprüfung (DOM, kein Browser-/Gerätetest):

    npm install --prefix /tmp/silben-dom-qa jsdom@26.1.0
    node scripts/check-practice-dom.mjs /tmp/silben-dom-qa/node_modules/jsdom/lib/api.js
    python3 scripts/check-native-fonts.py

## Schul-Druckschrift ab Version 1.5.1

Die Fotovorlagen zeigen ein rundes, einstöckiges kleines a. Nach Vergleich von
Fibel Nord, Fibel Süd, ABeeZee und Andika wird die unveränderte **Fibel Nord Regular**
von Peter Wiegel verwendet. Auch m, M, u und die übrigen Lesezeichen kommen aus dieser
Schrift. Die Druckschrift-Auswahl zeigt Ma als Probe. Ein größerer maximaler Schriftgrad
berücksichtigt die Proportionen dieser Schrift; die Anzeige passt sich weiterhin an.

Font und SIL-OFL-Lizenz liegen in `docs/silbengenerator/fonts/` und werden in Website,
Offlinecache und APK mitgeliefert. Vor dem Lesen wird auf die gewählte Schrift gewartet,
damit keine andere a-Form aus einer Geräteschrift erscheint. Timer, gespeicherte
Lernstufen und die beiden Schreibschriftmodelle bleiben erhalten.

Quelle: [Fibel-Schriften von Peter Wiegel](https://www.peter-wiegel.de/Fibel.html).
Prüfung: `python3 scripts/check-print-font.py`; ergänzend prüft die CSS-Integration,
dass das echte Druckschrift-Lesefeld Fibel Nord ohne künstliche Fettung verwendet.
