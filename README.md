# Games · Silbengenerator

Ein kleines Lesespiel für Kinder: eine große Silbenkette lesen, antippen und weiterlesen.
Als installierbare Web-App für Android gebaut. Der Code wird in diesem Repository gepflegt.

![Silbengenerator im Handy-Querformat](screenshots/silbengenerator-20261028.jpg)

## Spielen

**GitHub-Pages-Adresse nach einmaliger Aktivierung:** https://simonbl778.github.io/Games/silbengenerator/

Die GitHub-Pages-Adresse funktioniert erst, nachdem Pages wie unten beschrieben aktiviert und veröffentlicht wurde. Danach wird die spielbare Version automatisch bei Änderungen an `main` aktualisiert.

## Auf einem Android-Handy starten

1. Die veröffentlichte Spieladresse in **Google Chrome** öffnen.
2. Eine Höchstzahl von **1 bis 5** wählen und **Lesen starten** antippen.
3. Das Handy quer halten. Die App fordert beim Start Vollbild und Querformat an, soweit der Browser es erlaubt.
4. Die große Silbenkette antippen: Die nächste Kette erscheint. **Ändern** führt zur Auswahl zurück.

Ein APK, Android Studio, Entwickleroptionen und ein Play-Store-Eintrag werden nicht benötigt.

### Wie eine App installieren

In Chrome das Dreipunkt-Menü **⋮** öffnen und **Installieren und Verknüpfung erstellen → Installieren** auswählen. Je nach Chrome-Version heißt der Eintrag **Zum Startbildschirm hinzufügen → Installieren**. Das Spiel hat dafür auch die Schaltfläche **Aufs Handy**.

Nach der Installation über das eigene App-Symbol starten. Sobald auf der Auswahlseite **Offline bereit** angezeigt wird, sind alle notwendigen Spieldateien zwischengespeichert. Von diesem Gerät aus funktioniert das Spiel dann auch ohne Internet. Der Browser kann diese Daten entfernen, etwa wenn Website-Daten gelöscht werden. In diesem Fall einmal mit Internet neu öffnen.

Die Browseransicht in einer anderen App kann Installieren, Vollbild oder Drehen einschränken. In diesem Fall den Spiel-Link direkt in Chrome öffnen. Falls sich der Bildschirm nicht automatisch dreht, Androids automatische Drehung einschalten und das Handy drehen.

## Spielregeln

- Verfügbare Bausteine: **Mo, Mi, Mu, i, o, u**.
- Die gewählte Zahl ist eine **Höchstzahl**, keine feste Kettenlänge. Bei `3` entstehen zufällig Ketten aus `1`, `2` oder `3` Bausteinen.
- Jeder einzelne Vokal zählt als eine Silbe. `iou` besteht damit aus drei Bausteinen.
- Jeder Baustein kann innerhalb derselben Kette mehrfach vorkommen.
- Nur der **erste Buchstabe der gesamten Kette** wird zufällig groß- oder kleingeschrieben. Alle weiteren Buchstaben bleiben klein: zum Beispiel `Momiu` oder `momiu`, aber nicht `MoMiU`.
- Jede neue sichtbare Anzeige unterscheidet sich von der unmittelbar vorherigen.
- Die App zeigt beim erneuten Öffnen zuerst die Auswahl. Die zuletzt verwendete Höchstzahl ist lediglich vorausgewählt.
- Die Schriftgröße passt sich an die Kettenlänge und den verfügbaren Platz an. Die Kette bleibt in einer Zeile.

Es gibt keinen Zeitdruck, keine Punkte, keine Werbung, keine Tonwiedergabe und keine Spielerkonten. Das Spiel selbst sendet keine Lern- oder Nutzungsdaten. Es speichert lokal nur die letzte Auswahl und die Dateien für den Offlinebetrieb; das Hosting hat seine üblichen technischen Zugriffs- und ggf. Anmeldedaten.

## GitHub Pages einmalig einschalten

1. Im Repository **Games** zu **Settings → Pages** gehen.
2. Unter **Build and deployment → Source** die Option **Deploy from a branch** wählen.
3. Als Branch **main** und als Ordner **/docs** auswählen.
4. **Save** anklicken und die Veröffentlichung abwarten. GitHub nennt dafür bis zu etwa zehn Minuten.
5. Danach https://simonbl778.github.io/Games/silbengenerator/ öffnen.

Diese Veröffentlichung macht das Spiel öffentlich erreichbar. Das Repository ist bereits öffentlich. Es werden nur die statischen Dateien aus `docs/` veröffentlicht. `.nojekyll` schaltet die unnötige Jekyll-Verarbeitung aus. Für dieses Projekt sind kein eigener Build-Workflow und keine zusätzlichen Geheimnisse erforderlich.

## Silben ändern und weiterentwickeln

Die Bausteine stehen an genau einer Stelle: [`docs/silbengenerator/config.js`](docs/silbengenerator/config.js).

```js
export const SYLLABLES = Object.freeze(['Mo', 'Mi', 'Mu', 'i', 'o', 'u']);
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
| `docs/silbengenerator/manifest.webmanifest` | Android-Installation, Symbol und Ausrichtung |
| `docs/silbengenerator/service-worker.js` | Offlinebetrieb und Aktualisierung |
| `tests/generator.test.mjs` | Zehn Tests der Spielregeln |

### Lokal starten

Python 3 reicht für einen lokalen Webserver:

```sh
python3 -m http.server 8000 --directory docs
```

Danach `http://localhost:8000/silbengenerator/` öffnen. Die HTML-Datei nicht nur per Doppelklick als `file://` öffnen: ES-Module und Service Worker benötigen einen Webserver. Für PWA-Funktionen im Internet wird HTTPS benötigt; `localhost` eignet sich zum Entwickeln. Die eigentliche Android-Drehung und Installation bitte auf einem Android-Gerät prüfen.

### Prüfen

Mit Node.js 20 oder neuer, ohne `npm install` und ohne zusätzliche Pakete:

```sh
npm test
npm run check
```

### Eine Änderung veröffentlichen

1. Gewünschte Dateien ändern und die Tests ausführen.
2. **Bei jeder Änderung an einer ausgelieferten Spieldatei** `VERSION` in `service-worker.js` erhöhen, zum Beispiel von `1.0.0` auf `1.0.1`. Sonst bleibt auf bereits installierten Geräten möglicherweise die alte Offline-Version aktiv.
3. Änderungen auf GitHub in `main` übernehmen. Wenn GitHub Pages aktiviert ist, veröffentlicht GitHub den neuen Stand automatisch.
4. Das Spiel mit Internet erneut öffnen. Wenn **Eine neue Version ist bereit** erscheint, **Jetzt laden** antippen. Dabei wird wieder die Startauswahl angezeigt.
5. Zusätzliche Bereitstellungen auf anderen Hostingdiensten müssen getrennt aktualisiert werden. Künftige Pflege beginnt immer in diesem GitHub-Repository.

## Offizielle Hinweise

- [Google Chrome: Web-Apps auf Android verwenden](https://support.google.com/chrome/answer/9658361?hl=de&co=GENIE.Platform%3DAndroid)
- [GitHub: Eine Pages-Website erstellen](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site)
- [MDN: Grenzen der Orientierungssperre](https://developer.mozilla.org/en-US/docs/Web/API/ScreenOrientation/lock)

Version 1.0.0 · 28. Oktober 2026
