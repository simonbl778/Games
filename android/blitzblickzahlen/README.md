# Blitzblickzahlen als APK

Die App enthält dieselben Spieldateien wie `docs/blitzblickzahlen/`. Sie startet ab Android 8.0 (API 26) mit aktuellem Android System WebView im Hochformat und funktioniert ab der Installation vollständig offline, ohne Browserinstallation oder ChatGPT-Anmeldung.

Die signierte Datei liegt unter [`docs/downloads/blitzblickzahlen-1.2.1.apk`](../../docs/downloads/blitzblickzahlen-1.2.1.apk). Sie enthält Zeitgewichtung, 40 Punkte als Ziel und verhindert gleiche Karten direkt hintereinander. Auf dem Handy öffnen und bei der Android-Nachfrage die Installation aus der verwendeten Download- oder Dateien-App zulassen. Danach über das eigene App-Symbol starten. In der Auswahl und am Spielende lässt sich die installierte APK mit **App teilen** an andere Handys weitergeben. Das Android-Menü öffnet sich dafür mit der APK-Datei als Anhang.

Als Download-Alternative gibt es `Blitzblickzahlen-Android-1.2.1.zip` mit APK, Prüfsumme und `INSTALLATION.txt`. Dieses ZIP lässt sich wie beim Silbengenerator auf OneDrive ablegen und teilen. Auf dem Empfängerhandy entpacken und die enthaltene APK öffnen.

**Beim Wechsel von 1.1.0 auf 1.2.1 die alte APK-App einmal deinstallieren.** Der Benutzer hat einen neuen Signaturschlüssel genehmigt, weil der frühere nicht mehr vorhanden war. Dabei gehen die letzte Schwierigkeit und Toneinstellung verloren. Spätere Updates ab 1.2.1 verwenden denselben neuen Schlüssel.

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

Der neue Schlüssel ist **dauerhaft und nur für den Eigentümer in Google Drive gesichert**. [`signing-backup.json`](signing-backup.json) enthält Datei-ID, Speicherort, Backup-Prüfsumme und öffentlichen Zertifikat-Fingerabdruck. Die privaten Schlüssel- und Passwortdateien stehen nicht im Repository. `AGENTS.md` weist zukünftige Bearbeiter auf die Wiederherstellung hin.

In einer frischen Umgebung zuerst die Metadaten dieser Drive-Datei lesen und das dort referenzierte private ZIP mit dem Google-Drive-Connector als Datei herunterladen. Dann wiederherstellen:

```sh
python3 scripts/restore-apk-signing.py \
  --backup-file /privater/pfad/Blitzblickzahlen-Schluessel-PRIVAT-ab-1.2.1.zip \
  --signing-dir /privater/pfad/blitzblickzahlen-signing
npm run build:apk -- --sdk /pfad/zum/android-sdk --signing-dir /privater/pfad/blitzblickzahlen-signing
```

Das Wiederherstellungsskript prüft die ZIP-Prüfsumme und exportiert nur das öffentliche Zertifikat zum Identitätsvergleich, bevor es die Dateien übernimmt. Lokale Signierverzeichnisse müssen außerhalb des Git-Repositorys liegen. Der Build lehnt fehlende oder abweichende Signierschlüssel bei normalen Updates ab; er ersetzt sie nicht stillschweigend. `--allow-new-signing-key` ist ausschließlich für ausdrücklich genehmigte Schlüsselwechsel vorgesehen.

Der erste genehmigte Build erzeugt `release.p12`, `password.txt` und ein separates privates Backup-ZIP. Dieses Backup darf niemals in die öffentlichen Downloads oder eine geteilte App-ZIP kopiert werden. Die Kopie in Drive übersteht die Erneuerung des Arbeitsbereichs. Für Version 1.2.1 wurde die Wiederherstellung aus Drive samt erneutem APK-Build mit identischem Zertifikat geprüft.

## Aufbau und Prüfung

- `MainActivity.java` lädt ausschließlich die eingebauten Dateien über einen lokalen HTTPS-Ursprung und stellt die native Teilen-Schaltfläche bereit. Die App fordert keine Android-Berechtigungen an; auch eine Internetberechtigung ist nicht enthalten.
- `ApkProvider.java` gibt empfangenden Apps über eine temporäre Leseberechtigung ausschließlich die eigene installierte APK frei.
- Androids Zurück-Taste führt aus einer Partie zur Schwierigkeitsauswahl und beendet die App von dort aus. Beim Wechsel in eine andere App wird die Partie pausiert.
- Die Website und ihre PWA bleiben separat nutzbar. Ein Website-Update ändert eine bereits installierte APK nicht; dafür eine neue APK-Version installieren.

`npm run check:apk` prüft Prüfsumme und Inhalt der fertigen APK gegen die aktuellen Spieldateien. Der Build prüft Signatur und Ausrichtung zusätzlich mit `apksigner` und `zipalign`; die enthaltene Spiellogik wird mit Node und im Chromium-Browser getestet. Eine Installation und die native Teilen-Funktion sollten zusätzlich auf einem Android-Handy geprüft werden.
