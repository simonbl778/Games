# Blitzblickzahlen als APK

Die App enthält dieselben Spieldateien wie `docs/blitzblickzahlen/`. Sie startet ab Android 8.0 (API 26) mit aktuellem Android System WebView im Hochformat und funktioniert ab der Installation vollständig offline, ohne Browserinstallation oder ChatGPT-Anmeldung.

Die signierte Datei liegt unter [`docs/downloads/blitzblickzahlen-1.1.0.apk`](../../docs/downloads/blitzblickzahlen-1.1.0.apk). Auf dem Handy öffnen und bei der Android-Nachfrage die Installation aus der verwendeten Download- oder Dateien-App zulassen. Danach über das eigene App-Symbol starten. In der Auswahl und am Spielende lässt sich die installierte APK mit **App teilen** an andere Handys weitergeben. Das Android-Menü öffnet sich dafür mit der APK-Datei als Anhang.

Als Download-Alternative gibt es `Blitzblickzahlen-Android-1.1.0.zip` mit APK, Prüfsumme und `INSTALLATION.txt`. Dieses ZIP lässt sich wie beim Silbengenerator auf OneDrive ablegen und teilen. Auf dem Empfängerhandy entpacken und die enthaltene APK öffnen.

## Bauen

Benötigt werden Python 3, Java mit `keytool`, Android SDK Platform 35 und Build Tools 35.0.0 sowie `javac` (Java 8 oder neuer). Alternativ wird der Eclipse-Java-Compiler als Jar unterstützt; gebaut wurde mit ECJ 3.41.0 und Java 21.

```sh
npm run build:apk -- --sdk /pfad/zum/android-sdk
```

Ohne `javac`:

```sh
npm run build:apk -- --sdk /pfad/zum/android-sdk --ecj /pfad/zu/ecj-3.41.0.jar
```

`app.json` legt Paketname, Android-Versionen und APK-Versionsnummer fest. Bei einem neuen App-Release `versionCode` erhöhen und `versionName` sowie den APK-Link in der HTML-Datei gemeinsam aktualisieren. Der Build kompiliert Java und DEX, bündelt die aktuellen HTML/JS/CSS-Dateien, richtet die APK aus und signiert und prüft sie mit `apksigner`. Er schreibt zusätzlich die SHA-256-Prüfsumme und `release.json` mit Zertifikat und Dateihashes. Die SDK-Werkzeuge und der Compiler werden nicht mit der App ausgeliefert.

## Signaturschlüssel für Updates

Der erste Build erzeugt einen privaten Schlüssel und ein Passwort außerhalb des Repositorys, standardmäßig unter `~/.local/share/blitzblickzahlen-signing/`. `--signing-dir` wählt ein anderes privates Verzeichnis. Für die hier veröffentlichte Version wurde `/workspace/shared/blitzblickzahlen-signing/` verwendet.

**Dieses Verzeichnis privat sichern und für spätere APK-Updates wiederverwenden.** Es enthält `release.p12` und `password.txt`; beide gehören weder ins Git-Repository noch in eine geteilte APK. Ohne denselben Schlüssel kann Android eine bestehende Installation nicht als Update ersetzen. Der öffentliche Zertifikat-Fingerabdruck steht in `release.json`.

## Aufbau und Prüfung

- `MainActivity.java` lädt ausschließlich die eingebauten Dateien über einen lokalen HTTPS-Ursprung und stellt die native Teilen-Schaltfläche bereit. Die App fordert keine Android-Berechtigungen an; auch eine Internetberechtigung ist nicht enthalten.
- `ApkProvider.java` gibt empfangenden Apps über eine temporäre Leseberechtigung ausschließlich die eigene installierte APK frei.
- Androids Zurück-Taste führt aus einer Partie zur Schwierigkeitsauswahl und beendet die App von dort aus. Beim Wechsel in eine andere App wird die Partie pausiert.
- Die Website und ihre PWA bleiben separat nutzbar. Ein Website-Update ändert eine bereits installierte APK nicht; dafür eine neue APK-Version installieren.

`npm run check:apk` prüft Prüfsumme und Inhalt der fertigen APK gegen die aktuellen Spieldateien. Der Build prüft Signatur und Ausrichtung zusätzlich mit `apksigner` und `zipalign`; die enthaltene Spiellogik wird mit Node und im Chromium-Browser getestet. Eine Installation und die native Teilen-Funktion sollten zusätzlich auf einem Android-Handy geprüft werden.
