# Kamera verstehen · Lernraum und freies Labor

Browserbasiertes Lehrlabor für digitale Fotografie. Deutsch und Englisch; helles und dunkles Farbschema. Statisches Hosting ohne Analyse-Tracker und ohne Kamera- oder Mikrofonberechtigung.

## Start

Modulversion: `python -m http.server 8000 --directory dist`, dann http://localhost:8000. Die zusätzliche Kamera-verstehen.html ist ein eigenständiges Offline-Dokument. Der öffentliche Sites-Ursprung bleibt https://kamera-verstehen.daveporkins.chatgpt.site/.

## Freies Labor

Kameraquerschnitt, Aufnahme, Raumplan und Einstellungen teilen einen Simulationszustand. Kamera und Objekte im Raumplan ziehen, Bauteile im Kameraschnitt verändern oder Regler benutzen. Brennweite und Blende sind kontinuierlich; Belichtungszeit und ISO bieten Stufen. Der reguläre Fokusregler endet bei 50 m; ältere geteilte Konfigurationen bleiben lesbar. Ein Klick auf ein sichtbares Motiv fokussiert auf dessen Tiefe.

Die mobile Anordnung verschiebt die ursprünglichen Bedienelemente ohne Duplikate. Eine feste Bildvorschau, Tabs und ein scrollbarer Arbeitsbereich passen die Bedienung an kleine Bildschirme an. Im Menü ist der Wechsel zwischen automatischer, mobiler und Desktop-Anordnung möglich.

DE / EN schaltet die Sprache mit einem Klick. Der Theme-Schalter nennt den nächsten Modus (Hell/Dunkel bzw. Light/Dark). Beide Einstellungen werden lokal gespeichert.

Unter Licht & Bewegung haben Laterne/Spot, Fenster und Lichterkette eigene Helligkeitsregler. Die Nachtvorgabe aktiviert Fenster und Lichterkette; beide können unabhängig ausgeschaltet werden. +1 EV verdoppelt die jeweilige Emission bzw. Lampenleistung. Laterne und Spot beleuchten den Raum über ein vereinfachtes Abstandsgesetz und eine Richtkeule. Fenster und Lichterkette sind selbstleuchtende Motive und werfen im Modell kein Licht auf andere Objekte.

Gehende Personen kehren innerhalb des sichtbaren Bildbereichs um. Ball und Vogel laufen an der Bildgrenze weiter; am Übergang zeichnen Randkopien den kontinuierlichen Wiederholungsweg. Die animierten Bahnen passen sich dem Bildfeld an. Es handelt sich um bewusst wiederholbare Demonstrationsbewegung, nicht um eine Welt- oder Kollisionssimulation.

Die acht ursprünglichen Übungen, Sensoratlas, A/B-Vergleich, Galerie und QR-Freigabe bleiben erhalten. Fotos samt Einstellungen liegen nur im lokalen Browserspeicher. Galerie sichern/importieren erzeugt bzw. liest eine lokale JSON-Sicherung. Reset löscht keine Fotos. Ein anderer Ursprung hat einen anderen lokalen Speicher. QR-Codes entstehen lokal mit qrcode-generator (MIT; Lizenz unter dist/vendor).

## Separater Lernraum

Tour & Demo öffnet eine eigene Ansicht mit eigenen Reglern und Canvas-Flächen. Die Regler des freien Labors werden nicht darin wiederverwendet oder während der Vorführung laufend umgebaut. Das Simulationsmodell bleibt gemeinsam. Beim Beenden kann der vorherige Aufbau einschließlich aktiver Übung wiederhergestellt oder der Lernaufbau übernommen werden.

Die geführte Tour hat acht Kapitel: Fokus, Blende, Brennweite, Bewegungsunschärfe, wenig Licht/Automatik, eigene Lichtquellen, Lamellen/Bokeh und Verschluss. Sie beginnt mit einem Fokusregler und fügt die jeweils benötigten Einstellungen hinzu. Aufnahmebild und Kameraschnitt bleiben im Blick; Raum und Verschlussdetail erscheinen nur in passenden Kapiteln. Aufgaben haben konkrete Zahlenziele. Ziel einstellen kennzeichnet das angewendete Beispiel ausdrücklich.

Die Demo hat neun Kapitel mit zusammen etwa 2:25 Minuten Abspielzeit. Nach jedem Kapitel hält sie an. Weiter startet erst nach einem Klick; Wiederholen setzt nur das aktuelle Kapitel zurück. Ihr Zeiger folgt dem tatsächlich sichtbaren Regler. Weiche Übergänge sind direkt wählbar und standardmäßig aktiv. Pause hält Einstellung und Bewegungszeit an; manuelle Änderungen pausieren die automatische Einstellung. Der separate Winken-Schalter kann anschließend die Motivbewegung starten, während die automatische Reglerfahrt pausiert bleibt. Die Verschlussfolge zeigt erst einen langsamen und dann einen schnellen vollständigen Ablauf.

## Blende und Verschluss vertiefen

Optik öffnet das Blenden-/Bokeh-Labor oder den Verschluss. Das Bokeh-Beispiel enthält eine Person bei 5 m und eine erkennbare Lichterkette bei 30 m. Zwischen Person und Lampen fokussieren, Öffnung und gerundete Lamellen vergleichen. Frühere Formmasken bleiben lesbar, werden im Einstieg aber nicht angeboten.

Der Verschluss zeigt Öffnen, Belichten und Schließen als einzeln anwählbare Phasen. Kurze Verschlusszeiten werden gleichmäßig verlangsamt; bei langen Zeiten wird nur die Wartezeit zwischen den beiden gleich schnellen Vorhangfahrten verkürzt. Die dunklen Abdeckungen sind als erster und zweiter Vorhang beschriftet, der freiliegende Sensor grün. Reale Zeitverhältnisse ist ein zusätzlicher Vergleich. Die Positionen selbst stammen weiter aus dem physikalischen Zwei-Vorhang-Modell mit beispielhafter Laufzeit 4 ms. Die Belichtungszeit gilt für jede Zeile, nicht für die Gesamtdauer des Durchlaufs. Eine Folge endet nach dem Schließen und springt nicht unbemerkt zum Anfang.

## Korrektur von Tiefenreihenfolge und Wiedergabe

Die Szenenobjekte werden vor dem Zeichnen nach Entfernung sortiert. Dadurch verdeckt die Person einen weiter entfernten Ball korrekt; die Fokussierauswahl folgt derselben sichtbaren Reihenfolge. Ein vorzeitiges return hatte die Sortierung und Randkopien bisher übersprungen. Alle drei Animationsschleifen planen auch nach einem einzelnen Zeichenfehler den nächsten Frame; Fehler bleiben dabei sichtbar und werden nicht verschluckt. Läuft die Vorschau mit ausschließlich Tempo 0, erklärt ein Hinweis den unbewegten Aufbau.

## Prüfung und Grenzen

`node verify.mjs`: 76 Modellprüfungen plus 352.944 manuelle Parameterkombinationen und 1.152 Automatik-/Lichtfälle.

`node verify-ui.mjs` bzw. `npm run test:ui`: 24 isolierte DOM-/Komponententestgruppen mit Happy DOM und Skia. Entwicklungsabhängigkeiten sind nicht Teil des veröffentlichten Browsercodes. Die Prüfungen decken Bedienung, Wiederherstellung, alle Kapitel, kontinuierliche Regler, Sprache/Theme, Galerie und neue Lichtwerte ab. Sie bestätigen kein CSS-Layout.

Am 29.10.2026 war die Browsersteuerung wieder erreichbar. Der Lernraum, das manuelle Winken in einer pausierten Demo, die mobile Kameraansicht sowie die Verschlussphasen wurden im integrierten Browser praktisch geprüft (1280 × 720 und 390 × 844). Die frühere Schnittstellenmeldung „Local browser use is disabled in Work settings“ belegt keine bewusste Einstellungsänderung durch den Nutzer. Eine feste Bildrate auf jedem Gerät wird nicht zugesichert.

Optik: idealisiertes Zwei-Gruppen-Modell bzw. ausdrücklich vereinfachtes Dünnlinsen-Schema. Keine Konstruktion eines bestimmten Objektivs und keine vollständige Wellenoptik, PSF-Faltung, Reflexions-, Schatten- oder Kollisionssimulation. Rauschen, Stabilisierung und Porträtmasken sind didaktische Näherungen. ISO sammelt keine zusätzlichen Photonen. Der Schärfebereich beschreibt ein Betrachtungskriterium, keine harte physikalische Grenze.

Die Vorschau benutzt während Bewegung und Eingriffen eine begrenzte Rasterauflösung; angehaltene Aufnahmen werden höher aufgelöst berechnet.

## Sicherung und Hosting

Vor der Korrektur wurde auch Version 12 (Commit a1edf87836f6d158eb899319bfbc5c36405f3229) unter outputs/Backups/2026-10-29-Version-12 gesichert.

Vor dem Umbau wurde Version 11 (Commit c76fc1924cc81b0316acacf65d69929344df3e42) separat als Quellcode- und Webseiten-ZIP gesichert: outputs/Backups/2026-10-29-Version-11. Ältere Sicherungen bleiben erhalten.

Das Verzeichnis dist/ kann auf einem statischen Hoster liegen. Das portable Paket legt die Dateien im Wurzelverzeichnis ab und enthält .nojekyll für GitHub Pages. Die Sites-Identität in .openai/hosting.json bleibt an das bestehende Projekt gebunden.

## Layout, Didaktik und Lamellen · Überarbeitung

Die fünf Bereiche besitzen dezente eigene Kopffarben. Kamera-Beschreibung und ihre Leerzeile sind entfernt; der erste Bauteilregler heißt Brennweite. Die Fokusdetails bleiben auch mit drei Motivpunkten im Canvas. Der Lichtbereich hat umbruchfreie englische Bezeichnungen, reservierte Höhe und einen Scroll-Fallback. Übungsaufgaben benutzen wieder eigenständige Kartenstile, getrennt vom Tour-Hinweis.

Die Demo stoppt kapitelweise. Dolly-Zoom ist ausdrücklich benannt. Das Fensterkapitel vergleicht selbstleuchtende Motive mit beleuchteten Flächen; der Nachtaufbau bietet einen Vergleich zwischen längerer Belichtung mit niedriger ISO und kurzer Zeit zum Einfrieren von Bewegung. Reglerausgaben haben stabile, umbruchfreie Werteflächen.

Die sichtbaren Lamellenflächen folgen genau der Pupillenkontur, die auch die geometrischen Lichtflecken bestimmt. Die Kontur wird nicht nachträglich über unpassende Lamellen gezeichnet. Der vereinfachte Aufbau zeigt sichtbare Flächen, keine gerätespezifische Gelenkmechanik. Pixeltests vergleichen die tatsächlich gezeichnete Öffnung mit der optischen Kontur. Im Lernraum gibt es eine vergrößerte Gegenüberstellung von Lamellen und Lichtfleck.

Die bewegte Vorschau hat eine höhere Untergrenze für ihre Rasterauflösung; die vorhandene adaptive Begrenzung bleibt erhalten. Eine garantierte Bildrate oder eine vollständige Wellenoptik-Simulation ist damit nicht verbunden.

Fachliche Quellen: [Nikon · Rounded Diaphragm](https://imaging.nikon.com/imaging/lineup/lens/glossary/), [Sony · Verschlussstruktur](https://support.d-imaging.sony.co.jp/support/ilc/flicker/01/en/).

## Oberflächenfinish · Version 16

Die Oberfläche verwendet eine neutrale blaue Grundpalette. Einstellungen, Kameraschnitt, Raumplan, Aufnahme und Lichtbereich haben jeweils durchgehende blaue, violette, rosafarbene, türkise und orange Flächen. Helle und dunkle Palette sind explizit abgestimmt; die Farben der simulierten Aufnahme bleiben unverändert.

Die Lichtsektion beansprucht nur ihre Inhaltshöhe. Dadurch erhält das Foto mehr Fläche. Transparente Randbereiche übernehmen den Hintergrund des Aufnahmebereichs. Sensorformat und vollständiger Bildausschnitt bleiben erhalten; die Darstellung wird weder beschnitten noch gestreckt.

Raumplan-Texte und Griffe besitzen eine von der Höhe unabhängige Mindestgröße. Auch die Auswahlradien skalieren mit der tatsächlichen Pixeldichte. Die Kamerabewegung wurde per Drag im Browser geprüft. Auto-/AF-Schalter stehen nach dem Zahlenwert ganz rechts, auch beim Weißabgleich.

Unter Bild & Sensor erläutern ausklappbare Hinweise das Schärfekriterium, Stativ/Stabilisierung und ND. Fein prüfen · 2 Sensorpixel verändert die Bewertung und den grünen Bereich, nicht das optische Foto. Beim Stativvergleich mit 1/4 s empfiehlt die Erklärung Blende auf Auto, damit die Belichtung passt.

24 Bedienungstestgruppen bestehen. Ein zusätzlicher Pixelvergleich bestätigt, dass sich das optische Foto beim Wechsel des Schärfekriteriums nicht ändert, während Stativ und Stabilisierung bei langer Belichtung tatsächlich einen Unterschied machen.
