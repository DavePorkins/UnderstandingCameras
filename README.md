# Fotolabor · Licht verstehen (V4)

Browserbasiertes Lehrlabor für digitale Fotografie. Deutsche Oberfläche; statisches Hosting; keine Analyse-Tracker und keine Kamera- oder Mikrofonberechtigung. QR-Codes werden lokal mit qrcode-generator (MIT, Lizenz unter `dist/vendor/`) erzeugt.

## Starten

`python -m http.server 8000 --directory dist` im Projektordner ausführen, anschließend http://localhost:8000 öffnen. Die Modulversion benötigt HTTP. Die zusätzliche eigenständige `Fotolabor.html` enthält Styles, Skripte und QR-Bibliothek in einer Datei.

## Bedienung

- Die komplette Arbeitsfläche passt sich dem verfügbaren Desktop-Browserfenster an. „Vollbild“ fordert Browser-Vollbild an; Esc beendet es. Falls der Browser die Anfrage abweist, nennt die Oberfläche das Browsermenü als Alternative.
- Kamera und Gegenstände im Raumplan ziehen. Doppelklick oder der Knopf in der Raumüberschrift fokussiert das gewählte Objekt. Eine freie Stelle setzt manuellen Fokus. Gegenstände hinter der Kamera werden im Foto nicht dargestellt. Die gemeinsamen Weltgrenzen sind −40 bis 80 m; die Kamera kann zwischen −40 und 40 m stehen.
- „Automatik ein“ aktiviert P, AF auf das gewählte Motiv und Auto-WB. „Automatik aus“ übernimmt die aktuellen Ergebnisse in M und beendet Auto-ISO, AF und Auto-WB. Einzelne Auto-Schalter sind weiterhin getrennt nutzbar.
- Die Ausschnittssperre beim Formatwechsel ist standardmäßig aus. Ein Smartphone hat eine feste effektive Blende, ohne den gespeicherten Blendenwert für Wechselobjektive zu überschreiben.
- Der Atlas zeigt Sensorflächen sowie berechnete Vergleichsbilder. Wählbar: gleicher horizontaler Bildwinkel oder gleiche reale Brennweite. Die Zeitautomatik gleicht die Belichtung an. Smartphone ƒ/1.8, übrige Profile ƒ/4.
- „Foto“ speichert Aufnahme und vollständige Konfiguration lokal. Die Galerie kann Einstellungen wiederherstellen, zwei Aufnahmen mit Wertedifferenzen vergleichen und PNGs exportieren. Sie fasst 20 Fotos. Browserspeicher und Website-Ursprung bestimmen die Aufbewahrung; beim Löschen von Websitedaten gehen diese Aufnahmen verloren. Reset löscht keine Galerie.
- „Teilen“ zeigt Link und QR-Code; optional mit aktuellen Einstellungen. Das ändert keine Zugriffsfreigabe der Website.
- Acht Aufgaben besitzen Ausgangsbilder, überprüfbare Ziele, Hinweise und Lösungseinstellungen. Sie starten direkt im Labor, ohne zweites Dialogfenster.
- Lampe und Fensterlicht lassen sich getrennt aktivieren. Die Lampe kann im Raum verschoben werden; die Stärke ist EV₁₀₀ in 1 m Abstand. Die Automatik misst am ausgewählten Motiv. Die EV-Statistik der Aufnahme bezieht sich weiterhin auf die Umgebungsreferenz.

## Prüfung

`node verify.mjs` prüft Optik, Belichtung, Schärfentiefe, Formatwechsel, Automatiken, Lichtquellen, Aufgabenlösungen, Galerie-Speicherung und QR-Erzeugung. Zusätzlich werden 120 Kombinationen aus Sensor, Brennweite und Blende geprüft. JavaScript-Module können mit `node --check dist/app.mjs` usw. auf Syntax geprüft werden.

## Modellgrenzen

Idealisiertes Zwei-Gruppen-Kameraschema, keine Konstruktion eines konkreten Objektivs. Das seitliche Fokusdetail vergrößert die Längsabstände; die vergrößerten Kreisgrößen sind ebenfalls separat skaliert. Geometrische Schärfentiefe und Unschärfekreise verwenden die Dünnlinsen-Näherung. Außerhalb des Schärfekriteriums nimmt die Unschärfe stetig zu, nicht sprunghaft.

Die 2,5D-Szene verwendet Objektlagen. Lampenlicht wird je Objekt und auf einer Bodenebene angenähert; keine berechneten Schatten, Reflexionen oder spektrales Mischlicht. Die Lichtstärke folgt mit begrenztem Nahbereich dem Abstandsgesetz und einer weichen Richtkeule. Auflösung beeinflusst Pixelabstand und Schärfekriterium, nicht die Pixelzahl des Vorschau-Canvas. Rauschen, Weißabgleich, Stabilisierung, Porträteffekt und Bewegungsintegration sind didaktische Näherungen. Die Vorschau zielt auf 30 Bilder/s mit begrenzter Renderauflösung; tatsächliche Geschwindigkeit hängt vom Gerät ab.

## Hosting und Daten

`dist/` kann auf einem statischen Hoster veröffentlicht werden. Das portable Quellcodepaket legt diese Dateien direkt im Wurzelverzeichnis ab; für GitHub Pages dort `/(root)` wählen. `.nojekyll` ist beigefügt. `.openai/hosting.json` gehört nur zum bestehenden Sites-Projekt und ist nicht im portablen Paket.

Die Anwendung lädt keine externen Schriften, Fotos oder QR-Dienste nach. Galerieaufnahmen bleiben im Browserspeicher. Die Sites-Zugriffsfreigabe bleibt separat erhalten. Quellen und die MIT-Lizenz sind beigefügt.

## Vorgemerkt

Deutsch/Englisch-Umschaltung nach inhaltlicher Freigabe der deutschen Fassung; derzeit bewusst keine teilweise übersetzte Oberfläche.
