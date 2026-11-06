# Silbengenerator als Android-App

Für das zweite Spiel: [Blitzblickzahlen als APK oder ZIP](../android/blitzblickzahlen/README.md).

**Direkter Download über die Spielseite:**
[APK herunterladen](https://silbengenerator-simonbl778.simon-bl778.chatgpt.site/downloads/silbengenerator-1.1.0.apk) ·
[ZIP zum Weitergeben](https://silbengenerator-simonbl778.simon-bl778.chatgpt.site/downloads/Silbengenerator-Android-1.1.0.zip).
Die gleichen Dateien liegen wie bei Blitzblickzahlen unter `docs/downloads/` und werden mit den Spielseiten veröffentlicht. Zum Spielen nach der Installation ist keine Anmeldung nötig.

[**Installationsdatei herunterladen**](https://github.com/simonbl778/Games/raw/refs/heads/main/docs/downloads/silbengenerator-1.1.0.apk)

**Alternative bei Downloadproblemen:** [ZIP-Datei mit APK und Anleitung herunterladen](https://raw.githubusercontent.com/simonbl778/Games/refs/heads/main/docs/downloads/Silbengenerator-Android-1.1.0.zip).
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

Die Auswahl bleibt unverändert: bei maximal 1 immer eine Silbe, bei maximal 2
eine oder zwei, bei maximal 3 zwei oder drei, bei maximal 4 drei oder vier und
bei maximal 5 vier oder fünf Silben.

Vor dem Start zwischen **Druckschrift** und echter verbundener **Schreibschrift**
(Lateinische Ausgangsschrift) wählen. Die Schrift ist lokal in der App enthalten.
Druckschrift ist vorausgewählt.

Gleiche Vokale an Silbengrenzen kommen nur als sehr seltene Ausnahme vor.
Auf der Startseite lässt sich **Silben dezent einfärben** einschalten: Die
Silben wechseln dann zwischen dunklem und sanftem Grün. Standardmäßig ist
diese Farbhilfe ausgeschaltet.

## Aktualisieren

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
