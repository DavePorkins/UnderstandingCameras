# Kamera verstehen · Optik und Aufnahmetechnik (Tour, Optik, Desktop und Mobil)

Browserbasiertes Lehrlabor für digitale Fotografie mit deutscher und englischer Oberfläche. Statisches Hosting, keine Analyse-Tracker, keine Kamera- oder Mikrofonberechtigung. QR-Codes entstehen lokal mit qrcode-generator (MIT, Lizenz unter `dist/vendor/`).

## Starten

`python -m http.server 8000 --directory dist` im Projektordner ausführen, anschließend http://localhost:8000 öffnen. Die Modulversion benötigt HTTP. Die zusätzliche eigenständige `Kamera-verstehen.html` enthält Styles, Skripte und QR-Bibliothek in einer Datei und kann offline geöffnet werden.

## Bedienung

- Bis 900 px Fensterbreite startet eine eigene mobile Anordnung mit fester Bildvorschau, vier Tabs und einem scrollbaren Arbeitsbereich. Querformat zeigt Bild und Bedienung nebeneinander. Im Menü kann Automatisch, Mobil oder Desktop gewählt werden; die Anordnung wird lokal gespeichert. Die mobile Darstellung ist in `dist/mobile.mjs` und einem eigenen CSS-Bereich gekapselt. Vorhandene Bedienelemente werden verschoben, nicht dupliziert; es gibt einen gemeinsamen Simulationszustand.
- Die Arbeitsfläche passt sich dem verfügbaren Desktopfenster an. Vollbild nutzt die Browserfunktion; Esc beendet sie. Kleine Fenster skalieren die Fläche, wodurch Schrift kleiner wird. Für den Beamer ist ein großes Fenster empfohlen.
- Dunkel oben neben der Sprache schaltet das Farbschema um. Die Auswahl bleibt lokal gespeichert; beim ersten Besuch gilt die Systemeinstellung. Diagramme und Dialoge wechseln mit, die simulierte Aufnahme behält ihre Belichtung.
- Deutsch/English oben wählen. `?lang=en` öffnet direkt Englisch; geteilte Links übernehmen die Sprache.
- Kamera und Objekte im Raumplan ziehen. Nach unten im Plan bedeutet nach rechts im Foto. Doppelklick im Plan oder Klick auf ein sichtbares Objekt im Foto fokussiert. Die Kamera verändert ihren Standort, während Weltpositionen der Objekte bestehen bleiben.
- Komponenten im Kameraschnitt wählen: Der passende Regler wird markiert. Sensorgröße folgt dem Format und bleibt beim Zoomen unverändert. Mehrere Motivpunkte zeigen, wie unscharfe Entfernungen Kreise auf dem Sensor erzeugen.
- Automatik ein aktiviert P, AF und Auto-WB. Automatik aus übernimmt die erreichten Werte als manuelle Einstellungen. Einzelne Automatiken bleiben getrennt nutzbar. Smartphone-Blende ist fest; der Wert für Wechselobjektive bleibt erhalten.
- Mobil liegen Bildoptionen, Messwerte und A/B-Vergleich hinter den drei Punkten am Aufnahmebild. Menü, Experimente, Atlas, Galerie und Freigabe sind unter ☰ erreichbar. Dort lässt sich die Vorschaugröße wählen. Der Raumplan unterstützt Ziehen; die zusätzliche Objektauswahl erlaubt Fokussieren ohne Doppeltippen.
- Die acht Übungen starten direkt im Labor. Mobil werden passende Regler vorausgewählt, andere lassen sich über Alle Regler zeigen einblenden. Der farbige Lernbereich zeigt Ziel, Fortschritt und automatische Erfolgserkennung. Licht und Bewegung sind während der Aufgabe festgelegt. Das Ausgangsbild bleibt für den Vergleich erhalten; danach führt Weiter zur nächsten Übung.
- Die Galerie speichert bis zu 20 Fotos mitsamt Einstellungen lokal. Vergleiche und PNG-Export verwenden die wirklich gespeicherten Bilder. Galerie sichern exportiert eine JSON-Datei; Galerie importieren ergänzt gültige Aufnahmen ohne Duplikate. Reset löscht keine Fotos. Löschen von Browserdaten oder ein anderer Website-Ursprung trennt den Speicher; deshalb vor einem Umzug sichern.
- Teilen zeigt Link und QR-Code, optional mit Einstellungen. Galerieaufnahmen werden nicht im Link übertragen und nicht auf dem Server veröffentlicht.
- Der Sensoratlas vergleicht sechs Formate am gleichen Standort, entweder mit gleichem horizontalem Bildwinkel oder gleicher realer Brennweite. Zeitautomatik gleicht die Belichtung an.
- Straßenlampe erzeugt breites Licht, der Spot eine drehbare Richtkeule. Leistung wird als EV100 bei 1 m angegeben. Automatik misst das ausgewählte Motiv; der EV-Wert im Aufnahmefeld beschreibt dagegen die Umgebungsreferenz. Fenster sind selbstleuchtende Flächen und beeinflussen die Beleuchtung anderer Objekte nicht.

## Prüfung

`node verify.mjs` prüft 49 Eigenschaften sowie 352.944 manuelle Kombinationen aus Sensorformat, Brennweite, Blende, Zeit und ISO und 1.152 Automatik-/Lichtfälle. Das umfasst Optik, Schärfentiefe, Formatwechsel, Automatikgrenzen, Licht, Aufgabenlösungen, Übersetzungen, Galerie und QR-Erzeugung. Browserprüfungen ergänzen die rechnerischen Tests; siehe separaten Prüfbericht.

## Modellgrenzen

Idealisiertes Schema mit zwei Linsengruppen, keine Konstruktion eines konkreten Objektivs. Strahlen verwenden paraxiale Optik; Abstände im Schnitt sind komprimiert. Das Fokusdetail und seine Kreisgrößen werden getrennt vergrößert. Numerische Schärfentiefe und Unschärfekreise verwenden die Dünnlinsen-Näherung. Der Schärfebereich bezeichnet ein Kriterium akzeptabler Schärfe, keine harte physikalische Grenze.

Die 2,5D-Szene verwendet Objektlagen. Lampenlicht wird je Objekt und auf einer Bodenebene angenähert; keine berechneten Schatten, Reflexionen oder spektrales Mischlicht. Das Abstandsgesetz ist im Nahbereich begrenzt. Rauschen, Weißabgleich, Stabilisierung, Porträteffekt und Bewegungsintegration sind didaktische Näherungen. ISO sammelt keine zusätzlichen Photonen. Die Erläuterung zu Dual Native ISO verwendet Herstellerangaben, simuliert aber keine gerätespezifischen Rauschkurven.

Auflösung verändert Pixelabstand und Schärfekriterium, nicht die Pixelzahl der Vorschau. Beugungsweichheit wird auf die Ausgabe bezogen. Bewegte Vorschauen rendern mit begrenzter Auflösung und zielen auf 30 Bilder/s; Leistung hängt vom Gerät ab.

## Hosting und Daten

`dist/` kann auf einem statischen Hoster veröffentlicht werden. Das portable Quellcodepaket enthält diese Dateien im Wurzelverzeichnis; für GitHub Pages `/(root)` wählen. `.nojekyll` liegt bei. `.openai/hosting.json` gehört zum bestehenden Sites-Projekt und wird nicht in das portable Paket kopiert.

Die Anwendung lädt keine externen Schriften, Fotos oder QR-Dienste nach. Galerieaufnahmen bleiben lokal. Die öffentliche Freigabe der Website veröffentlicht keine lokalen Galerien. Externe Quellenlinks werden erst beim Öffnen besucht.

## Geführter Einstieg und Optiklabor

- **Tour & Demo** in der Hauptnavigation öffnet den Einstieg. Auf Mobilgeräten steht der Einstieg zusätzlich im Reglerbereich und im Menü. Frei erkunden ist jederzeit möglich; es gibt keinen erzwungenen Kursstart.
- **Geführte Tour**: sieben interaktive Schritte zu Fokus, Blende, Ausschnitt, Bewegung, wenig Licht, Pupillenform und Verschluss. Die Tour prüft die tatsächlichen Zustände. Zurück, Weiter, Überspringen und Beispiel zeigen sind getrennte Aktionen. Bestehende Übungen werden währenddessen ausgesetzt. Beim Beenden wird der vorherige Kamera- und Übungszustand wiederhergestellt; Mit diesem Aufbau weiter übernimmt ausdrücklich das neue Beispiel.
- **Demo ansehen**: acht deterministische Kapitel, zusammen ungefähr 1 Minute 49 Sekunden. Fokusfahrt, Öffnen der Blende, Zoom, Kamerarückfahrt, Bewegung, Nacht, Masken und Verschluss. Pause/Fortsetzen, Kapitelwechsel und Abbruch bleiben erreichbar. Manuelle Eingaben pausieren die Demo. Bei reduzierter Bewegung werden diskrete Zustände gezeigt und automatische Szenenbewegung unterdrückt. Keine automatische Sprachausgabe und kein Videoexport.
- **Optik** am Kameraschnitt bzw. **Optiklabor** im mobilen Kamerabereich öffnet die Vertiefung. Blende & Bokeh zeigt Irisfront, vergrößerten geometrischen Lichtfleck, Strahlen und dasselbe Foto. Die Öffnung kann radial gezogen oder mit Pfeiltasten verändert werden. Öffnungsform: runde Referenz, Iris mit 5/6/7/9/11 Lamellen, gerundete Lamellen, Herz- oder Fledermausmaske. A merken und A/B vergleichen verwenden denselben Vergleichsspeicher wie das Hauptlabor.
- **Verschluss & Zeit** zeigt zwei Vorhänge vor dem Sensor mit Abspielknopf und Phasenschieber. Der beispielhafte Vorhanglauf beträgt 4 ms. Bei kurzer Zeit entsteht ein wandernder Spalt; die gewählte Belichtungsdauer gilt pro Zeile. Das ist ein mechanisches Vergleichsmodell, keine Simulation aller Kameraarten. Smartphones integrieren elektronisch.
- **Kameraschnitt direkt bedienen**: Objektiv- und Fokusgruppe horizontal ziehen; Blende, Zeit und ISO vertikal. Die Alternative über Regler bleibt vorhanden. Ein Doppelklick öffnet die zugehörige Vertiefung. Die Linsenbewegung ist eine schematische Abstraktion eines Zwei-Gruppen-Modells.
- **Lichtpunkte im Hintergrund** sind unter Bild & Sensor zuschaltbar. Ihre Tiefe folgt der Hintergrundeinstellung. Die Pupillenform beeinflusst ihre geometrischen Defokusflächen. Die Form kehrt sich im Modell vor/hinter der Fokusebene um.

### Erweiterte Modellannahmen

Für nichtkreisförmige Pupillen ist die Blendenzahl eine Referenz zum umschreibenden Durchmesser. Die offene Fläche wird geometrisch ermittelt und als Transmission gegenüber der Kreisreferenz berücksichtigt. Manuelle Belichtung wird entsprechend dunkler; Automatik kann kompensieren. Der Unschärfedurchmesser und die numerische Schärfentiefe verwenden weiterhin die umschreibende runde Referenz. Der vertikale Strahlenschnitt verwendet die tatsächlich offene axiale Pupillensektion.

Lichtpunkte werden geometrisch abgebildet; ganze Objekte bleiben geglättete 2,5D-Lagen. Keine vollständige PSF-Faltung, Wellenoptik, Objektivfehler, Vignettierung oder gerätespezifische Messkurven. Ein exakt fokussierter Punkt bleibt geometrisch ein Punkt. Sehr kleine Öffnungen unterliegen in der Wirklichkeit der Beugung; eine Lochkamera macht nicht automatisch alles perfekt scharf. Eine Motivmaske ist keine Projektion des Motivs durch eine Jalousie.

### Regressionsprüfung

`node verify.mjs` umfasst nun 61 Prüfungen sowie weiterhin 352.944 manuelle Kombinationen und 1.152 Automatik-/Lichtfälle. Neue Fälle prüfen Pupillenflächen, Maskenverluste, Strahlen, Verschlusszeilen, erreichbare Tourziele, deterministische Demostände, Direktmanipulation, Legacy-Fotos und reduzierte Bewegung.

`npm install` installiert ausschließlich Entwicklungswerkzeuge. `npm run test:ui` führt zehn isolierte DOM-/Komponententests mit Happy DOM und Skia aus. Es gibt keine Abhängigkeiten dieser Werkzeuge im veröffentlichten Browsercode. Der Test bildet ausdrücklich kein CSS-Layout und keinen echten Browser ab. Er prüft gemeinsame Regler, A/B, Tour/Demo, Wiederherstellung, Layout-Reparenting, Sprache, Theme, Zeichnungsereignisse und Galerie. Im lokalen Codex-Workspace sind Testabhängigkeiten außerdem außerhalb des Checkout verfügbar.

Die neue Oberfläche konnte in diesem Durchlauf nicht visuell im Browser abgenommen werden: Windows Computer Use stoppte wegen nicht sicher ermittelbarer Browseradresse. Das ist als offene Prüfung dokumentiert. Separat wurden echte Renderer-Ausgaben mit Skia erzeugt und betrachtet. Diese sind keine Screenshots des Webseitenlayouts.

### Sicherung vor dem Umbau

Version 9 mit Quellcommit `54ce1bf770177c3061c33fdb688775292d7c9c61` ist als Source- und Webseiten-ZIP außerhalb dieses Checkout gesichert. Sie bleibt als gespeicherte Sites-Version erneut veröffentlichbar. Der Ordner `outputs/Backups/2026-10-28-Version-9` enthält Anleitung und SHA-256-Prüfsummen. Galerieaufnahmen bleiben lokal und werden nicht öffentlich eingebettet.
