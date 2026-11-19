# Silbengenerator als Android-App

Für das zweite Spiel: [Blitzblickzahlen als APK oder ZIP](../android/blitzblickzahlen/README.md).

**Direkter Download über die Spielseite:**
[APK herunterladen](https://silbengenerator-simonbl778.simon-bl778.chatgpt.site/downloads/silbengenerator-1.7.0.apk) ·
[ZIP zum Weitergeben](https://silbengenerator-simonbl778.simon-bl778.chatgpt.site/downloads/Silbengenerator-Android-1.7.0.zip).
Die gleichen Dateien liegen wie bei Blitzblickzahlen unter `docs/downloads/` und werden mit den Spielseiten veröffentlicht. Zum Spielen nach der Installation ist keine Anmeldung nötig.

[**Installationsdatei herunterladen**](https://github.com/simonbl778/Games/raw/refs/heads/main/docs/downloads/silbengenerator-1.7.0.apk)

**Alternative bei Downloadproblemen:** [ZIP-Datei mit APK und Anleitung herunterladen](https://raw.githubusercontent.com/simonbl778/Games/refs/heads/main/docs/downloads/Silbengenerator-Android-1.7.0.zip).
Die ZIP-Datei auf dem Handy entpacken und dann die enthaltene APK öffnen.
Falls ein Download im eingebauten Chat-Browser nicht startet, den Link über
**Im Browser öffnen** in Chrome öffnen und dort herunterladen.

Die APK kann auf OneDrive abgelegt und ihr Downloadlink per WhatsApp oder Mail
weitergegeben werden. Empfänger benötigen kein ChatGPT-Konto.

## Auf einem Handy installieren

1. Falls die alte Silbengenerator-APK (1.0.x) installiert ist, diese einmal deinstallieren. Die letzte Silben-Auswahl geht verloren; Lernstände werden nicht gespeichert.
2. Die APK auf das Android-Handy herunterladen und öffnen.
3. Falls Android nachfragt, der verwendeten App (z. B. Chrome oder OneDrive)
   erlauben, Apps aus dieser Quelle zu installieren.
4. **Installieren** antippen und danach das Symbol **Silbengenerator** öffnen.

Voraussetzung: **Android 8 oder neuer** und eine aktuelle Android-System-WebView.
Die App läuft von Anfang an offline, ohne Anmeldung, Werbung, Konten oder
zusätzliche Berechtigungen. Alle Spieldateien sind in der APK enthalten.

Für Zufallsketten gilt: bei maximal 1 immer eine Silbe, bei maximal 2 eine oder zwei, bei maximal 3 zwei oder drei, bei maximal 4 drei oder vier und bei maximal 5 vier oder fünf Silben. Ab Stufe 4 kommt spätestens jede vierte Aufgabe ein echtes Wort, ab Stufe 10 jede dritte und in Heft B jede zweite. Sind auf der gewählten Stufe noch keine langen echten Wörter vorhanden, dürfen Wortaufgaben kürzer ausfallen. Die Höchstzahl bleibt bestehen. Eigene Silbenauswahlen werden berücksichtigt; ohne passendes echtes Wort erklärt die Startseite die nötige Erweiterung.

Vor dem Start **Druckschrift**, **Lateinische Ausgangsschrift (LA)** oder
**Vereinfachte Ausgangsschrift (VA)** wählen. Standard ist Druckschrift.
Beide Schreibschriften und ihre Lizenz sind lokal enthalten; Anfangsgroßbuchstaben
bleiben mit der Kette verbunden. Die LA hat die Anstriche am Wortanfang,
die VA folgt der verlinkten VA-Vorlage.

Gleiche Vokale an Silbengrenzen kommen nur als sehr seltene Ausnahme vor.
Die Farbhilfe ist standardmäßig eingeschaltet: Die zweite und vierte Silbe
erscheinen dezent rot, die übrigen dunkelgrün. Sie lässt sich vor dem Start abwählen.

## Aktualisieren

**Version 1.7.0 lässt sich direkt über bestehende APKs ab 1.1.x installieren.** Der Signierschlüssel ist unverändert. Neu: am, im, um und om sind ab Stufe 4 vorausgewählt, em ab Stufe 5. Der Zähler addiert die tatsächlichen Silben pro bestätigter Aufgabe. Unten mittig erscheint ein geschätztes Tempo in Silben/min aus den letzten bis zu fünf Aufgaben; Hintergrundzeiten zählen nicht mit. Die App erkennt keine Lesefehler und vergibt keine schulische Normbewertung. Auf der Startseite ist **Version 1.7.0** sichtbar.

Die Ausgabe 1.1.0 ist neu signiert. Der frühere lokale Schlüssel wurde beim
Neustart der Arbeitsumgebung nicht übernommen. Beim Wechsel von 1.0.x ist
deshalb die oben beschriebene einmalige Neuinstallation erforderlich.

Für spätere Updates eine neue APK installieren, die mit demselben privaten Schlüssel signiert ist
und eine höhere Android-Versionsnummer hat. Die App dafür nicht deinstallieren,
wenn die letzte Auswahl erhalten bleiben soll. Die APK aktualisiert sich nicht
über die Web-App und nicht automatisch über den Play Store.

Die Datei mit der Endung `.sha256` enthält die Prüfsumme der APK.
Signatur, Paketinhalt, vollständige eingebettete Spieldateien und Spielregeln
wurden geprüft. Ein Lauf auf einem echten Android-Gerät steht noch aus.
