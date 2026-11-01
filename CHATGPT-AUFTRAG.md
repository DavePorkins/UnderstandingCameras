# Auftrag zum Einfügen in einen neuen ChatGPT-Chat

Ich habe dir das vollständige Quellcodepaket meiner statischen Kamera-Lernwebseite angehängt. Bitte veröffentliche die enthaltene Seminarfassung 17 als Aktualisierung meines bestehenden ChatGPT-Sites-Projekts.

**Bestehende Zieladresse:** https://kamera-verstehen.daveporkins.chatgpt.site/

**Bestehende Projektkennung:** `appgprj_6ae132dc11a88191add5d6e250397cd9`

Im ZIP stehen die Hosting-Angaben in `.openai/hosting.json`. Der zu veröffentlichende Ordner ist `dist/`. Der Code ist vollständig statisch und braucht keinen Build und keine API-Schlüssel. Bitte alle Dateien in `dist/` einschließlich `vendor/` übernehmen.

Prüfe zuerst, ob dir eine Sites-Veröffentlichungsfunktion zur Verfügung steht und ob der gerade angemeldete Account das bestehende Projekt aktualisieren darf. Die URL und Projektkennung allein geben keine Berechtigung. Falls du keinen Zugriff hast, sage mir das ausdrücklich. Lege in diesem Fall nicht einfach ein neues Sites-Projekt unter einer anderen Adresse an und behaupte nicht, die alte Seite aktualisiert zu haben.

Wenn Zugriff besteht: sichere die bisher veröffentlichte Fassung, veröffentliche den angehängten Quellstand im bestehenden Projekt und prüfe danach die Zieladresse in Desktop- und mobiler Größe. Ändere den Code für diese Übergabe nur, wenn zum Veröffentlichen technisch nötig.

Die wesentlichen Änderungen der neuen Fassung sind:

- Symbolschalter für Bewegung, Fokusrahmen, Zebra und Raster direkt im Kopf des Aufnahmebilds.
- Volle Bildbreite am Handy und Touch-Slider, die beim Antippen/vertikalen Scrollen ihren Wert behalten.
- Stabile Bildflächen bei Erfolgsmeldungen, Kapitelende und „Warum?“.
- Reset pro Tourkapitel; einmal erreichtes „Weiter“ bleibt freigeschaltet.
- Sichtbarer Auto-Shutter-Wert in der Blendenaufgabe.
- Fensterkapitel mit echten abgeschnittenen Lichtern und eingeschalteter Zebra-Warnung.
- Direkt bedienbare Blende im Optik-Strahlenschema und größere Verschlussdarstellung.

76 Modellprüfungen und 30 DOM-/Komponententestgruppen haben vor der Übergabe bestanden. Die Tour wurde in vier Browsergrößen geprüft. Bitte bestätige abschließend die tatsächlich veröffentlichte URL und welche Prüfung nach dem Veröffentlichen erfolgt ist.

Falls eine Aktualisierung des bestehenden Sites-Projekts nicht möglich ist, können wir GitHub Pages als Alternative verwenden. Die Anleitung und ein manuell startbarer Workflow stehen in `PUBLISHING.md` und `.github/workflows/pages.yml`. Das ergäbe eine andere URL. Starte diesen Ersatzweg erst, nachdem ich ihn ausgewählt habe.
