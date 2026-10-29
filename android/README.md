# Eigenständige Android-Version

Die kleine native Hülle zeigt das bestehende Spiel in Androids System-WebView.
Das Spiel wird über einen abgefangenen HTTPS-Ursprung vollständig aus den
eingebetteten APK-Assets geladen. Es gibt keine Internetberechtigung, keine
externen Bibliotheken und keine JavaScript-Schnittstelle zu Android.

Oberfläche, Silbenlogik und Auswahl kommen aus `docs/silbengenerator/`.
Nur in der gebauten Kopie entfallen die Web-App-Installation und der Service
Worker: Die App ist schon installiert und alle Dateien sind bereits offline
verfügbar. Die Web-Version bleibt unverändert.

## Bauen

Benötigt werden Python 3, Java 21, `keytool`, Android SDK Platform 35,
Android SDK Build Tools 35.0.0 und der Eclipse-Java-Compiler ECJ 3.41.0.
Die Android SDK-Komponenten gibt es von Google, ECJ im Maven Central Repository.
Nach dem Herunterladen ist der Build ohne weitere Downloads möglich.

```sh
python3 android/build.py \
  --android-jar /pfad/zum/android-sdk/platforms/android-35/android.jar \
  --build-tools /pfad/zum/android-sdk/build-tools/35.0.0 \
  --compiler /pfad/zu/ecj-3.41.0.jar
```

Das Skript baut Ressourcen, Java und DEX, bindet sämtliche Spieldateien ein,
richtet die APK aus und signiert und verifiziert sie. Die Ausgabe liegt in
`downloads/`. Android 8 ist die Mindestversion; es werden keine nativen
Prozessorbibliotheken gebraucht.

Vor dem Build:

```sh
npm test
npm run check
```

## Signierschlüssel und spätere Updates

Beim ersten Build wird ein privater Schlüssel mit zufälligem Passwort in
`android/signing/` angelegt. Schlüssel und Passwort werden nicht ins Repository
übernommen. Das dort erzeugte **private Schlüsselbackup** separat und sicher
aufbewahren; es gehört nicht zum Download für die Empfänger.

Für Updates denselben Schlüssel verwenden. `android:versionCode` im Manifest
muss steigen. `android:versionName` bestimmt den Dateinamen der neuen APK;
die Versionsnummer des gemeinsamen Games-Repositories ist davon unabhängig.
Änderungen an der Web-Version erfordern zusätzlich deren
übliche Service-Worker-Versionsänderung.

Zum Wiederherstellen die zwei Dateien aus dem privaten Backup in den Ordner
`android/signing/` entpacken. Ohne diesen Schlüssel können bestehende
Installationen nicht mit einer neuen APK derselben App aktualisiert werden.

Signatur und APK-Struktur sind automatisch geprüft. Installation, Vollbild,
Drehung und Bedienung auf einem echten Android-Gerät zusätzlich prüfen.
