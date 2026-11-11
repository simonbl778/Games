# Games: Hinweise für weitere Änderungen

## Blitzblickzahlen: APK-Signatur dauerhaft wiederverwenden

- Die aktuelle Signatur gilt ab APK-Version **1.2.1**. Die bisherigen Dateien unter `docs/downloads/` sind öffentlich; private Schlüssel gehören niemals dorthin.
- **Vor jedem APK-Build** `android/blitzblickzahlen/signing-backup.json` lesen. Die Datei enthält den privaten Google-Drive-Speicherort und den öffentlichen Zertifikat-Fingerabdruck, keine Schlüssel oder Passwörter.
- Fehlen die lokalen Signierdateien nach einem neuen Arbeitsbereich, das vorhandene private Drive-Backup wiederherstellen. Metadaten und Eigentümerfreigabe lesen, die ZIP über den Google-Drive-Connector als Datei herunterladen und mit `scripts/restore-apk-signing.py` nach außerhalb des Repositorys entpacken. Das Skript prüft Backup-Prüfsumme und Signaturidentität.
- Anschließend mit `--signing-dir` auf dieses Verzeichnis bauen. Ein normaler Versionswechsel braucht keinen neuen Schlüssel und keine erneute Deinstallation.
- `--allow-new-signing-key` nur bei ausdrücklich vom Benutzer gewünschtem Schlüsselwechsel verwenden. Die Zustimmung zum Wechsel auf Version 1.2.1 ist keine pauschale Zustimmung zu zukünftigen Wechseln.
- `release.p12`, `password.txt` und das private Backup niemals in Git, die Website, die APK oder das öffentliche Download-ZIP übernehmen. Keine privaten Schlüssel- oder Passwortwerte in Chat oder Toolausgaben ausgeben.
- Auch temporäre signierte Download-URLs (`download_url`) und komplette Datei-Referenzobjekte mit solchen URLs nicht ausgeben. Für den Download eine materialisierte Datei oder die Sediment-Datei-ID verwenden.
- Nach Änderungen an Spieldateien Service-Worker-Version erhöhen; für eine neue APK auch `versionCode`, `versionName` und Downloadlinks anpassen. `npm test`, `npm run check` und `npm run check:apk` prüfen.
