# Fotolabor · Licht verstehen

Ein eigenständiges, browserbasiertes Lehrlabor für digitale Fotografie. Deutsche Oberfläche, keine Laufzeit-Abhängigkeiten, keine KI-/API-Aufrufe, keine externen Bildassets oder Schriftdateien.

## Starten

Den Inhalt von `dist/` mit einem beliebigen statischen Webserver ausliefern. Beispielsweise im Projektordner:

```sh
python -m http.server 8000 --directory dist
```

Danach `http://localhost:8000` öffnen. Die Modulversion braucht HTTP; für direktes Öffnen liegt im Übergabepaket zusätzlich eine eigenständige `Fotolabor.html` mit eingebetteten Skripten und Styles.

## Prüfen

```sh
node verify.mjs
node --check dist/app.mjs
node --check dist/renderer.mjs
```

Die fachlichen Tests prüfen Bildwinkel, Dünnlinsen-Bildweite, DOF-Grenzen gegen den Unschärfekreis, Hyperfokaldistanz, ISO/Photonen-Trennung, EV, ND, Automatiken, Formatwechsel und Schärfemaßstäbe. Zusätzlich werden 120 Kombinationen aus Format, Brennweite und Blende geprüft.

## GitHub Pages

Im portablen Übergabepaket liegen die Webdateien bereits im Wurzelverzeichnis. Diese Dateien in ein neues öffentliches Repository hochladen. Unter **Settings → Pages → Deploy from a branch** den verwendeten Branch und **/(root)** wählen. Es ist kein Build und kein eigener Server erforderlich. `.nojekyll` sorgt für unveränderte statische Auslieferung. Die relativen Assetpfade funktionieren auch unter `username.github.io/repository/`.

Für das originale Sites-Projekt zeigt `.openai/hosting.json` auf `dist`. Diese Identitätsdatei gehört ausschließlich zu diesem konkreten Sites-Projekt und wird deshalb nicht in das plattformneutrale Übergabepaket kopiert.

## Beamer-Arbeitsfläche (V2)

Die Hauptansicht füllt das Fenster dauerhaft. Kameraquerschnitt, Raum und Aufnahme sind gleichzeitig sichtbar. Die Oberfläche ist für Desktop und 16:9-Projektion ausgelegt und bei 1280 × 720 sowie 1920 × 1080 auf Überlauf geprüft. Zusatzeinstellungen, Experimente und Quellen öffnen in Fenstern. `camera-view.mjs` enthält das neue Zwei-Gruppen-Kameraschema und den Raumplan. Gehen, Hand, Ball und Vogel haben getrennte Bewegungsparameter.

## Umfang

- Sechs generische Sensorprofile, frei kombinierbare Lehr-Optik und zwei Bauarten.
- Manuell, Zeitautomatik A/Av und Blendenautomatik S/Tv; feste Blende im Smartphone-Profil.
- Aufnahmebild, idealisierter Querschnitt/Strahlengang, Raumplan und Sensorflächen.
- Verstellbare Szene, Lichtmenge, Fokus, Bewegung, Weißabgleich und ND.
- A/B im Arbeitsspeicher, Konfigurationslink im URL-Fragment, PNG-Export.
- Acht geführte Experimente, Format-Atlas, Parameterkarte und Quellen.

## Grenzen

Die Szene nutzt 2,5D-Projektion und Unschärfe pro Objektlage. Keine optische Messsimulation, kein vollständiges Bokeh-/PSF-Modell, keine kalibrierten Gerätesensoren, kein Readout, keine reale RAW/HDR-Pipeline. Rauschen, Farbe und Stabilisierung sind didaktische Näherungen. Die genannten Kamerafamilien illustrieren Formate, keine tatsächlichen Gerätespezifikationen. Kamera- und Objektivparameter sind frei idealisiert; Bajonettkompatibilität wird nicht geprüft.

Die geometrische Schärfentiefe verwendet ein explizites Unschärfekriterium. Eine Änderung dieses Kriteriums verändert nicht das gerenderte optische Bild. Der Porträteffekt verändert das Bild, aber nicht die optischen DOF-Werte. ISO allein verändert bei konstanter Blende, Zeit und Beleuchtung nicht den Lichtmengenwert.

Die eingeblendeten EV-Werte beziehen sich auf eine gesetzte didaktische Szenenreferenz. Der relative Lichtwert pro Sensorfläche ist keine Messung in Lux, Photonen oder Elektronen. Bei der Rauschnäherung wird zusätzlich die gesamte Sensorfläche berücksichtigt; die Auflösung dient hier der Pixelabstands- und DOF-Betrachtung und ändert nicht die Renderauflösung.

## Daten und Zugriff

Keine Besucherinformationen oder Bilder werden vom Anwendungscode versendet. Die Anwendung nutzt keine Analyse-Tracker. Der jeweilige Hostinganbieter kann eigene technische Zugriffsprotokolle führen. Teilen eines Versuchs enthält nur die Parameter im URL-Fragment. A/B-Daten und Lernversuche werden beim Neuladen nicht dauerhaft gespeichert.

Recherche, Hostingbewertung und Ausbauplan stehen in den beigefügten Dokumenten und unter „Konzept & Quellen“ in der Anwendung. Die Umsetzung enthält keine übernommenen fremden Simulatoren oder Fotos.
