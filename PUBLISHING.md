# Veröffentlichen und an einen anderen Chat übergeben

Der vollständige Browsercode liegt in `dist/`. Er braucht keinen Build, keine Serverfunktionen und keine API-Schlüssel. `index.html` muss zusammen mit den übrigen Dateien und dem Ordner `vendor/` veröffentlicht werden.

## Bestehende ChatGPT-Sites-Seite

- Ziel: https://kamera-verstehen.daveporkins.chatgpt.site/
- Bestehende Projektkennung: `appgprj_6ae132dc11a88191add5d6e250397cd9`
- Hosting-Konfiguration: `.openai/hosting.json`
- Statischer Ordner: `dist`
- Seminarfassung: 17, Stand 1. November 2026

Die Konfiguration beschreibt das bestehende Ziel. Sie ist kein Zugangsschlüssel. Ein anderer Chat/Account muss eine passende Sites-Veröffentlichungsfunktion und Zugriff auf dieses Projekt besitzen. Ob das mit einem anderen Account möglich ist, wurde nicht bestätigt. Falls der Zugriff fehlt, nicht unbeabsichtigt ein neues Projekt unter einer anderen Adresse anlegen.

Für die Übergabe dieses Repository als ZIP hochladen. Der Chat hat dadurch die Dateien, auch ohne Zugriff auf den ursprünglichen Computer oder auf GitHub. Nur die URL der laufenden Webseite zu senden überträgt den Quellcode und die Projektberechtigung nicht zuverlässig.

Der Arbeitsauftrag steht in `CHATGPT-AUFTRAG.md`. Die getrennte Einzeldatei `Kamera-verstehen.html` ist eine Offline-Alternative; zum Aktualisieren des bestehenden Sites-Projekts ist das Repository-Paket mit `dist/` und `.openai/hosting.json` vorgesehen.

## GitHub als Quellcodeablage

Das Repository kann zunächst nur den Code speichern. Dadurch ändert sich die bestehende Sites-Adresse nicht. Ein anderer Chat kann den Code aus einem öffentlichen Repository lesen, sofern seine Werkzeuge GitHub/Downloads unterstützen. Das ZIP ist die zuverlässigere Übergabe, falls diese Werkzeuge fehlen. Bei einem privaten Repository ist zusätzlich berechtigter GitHub-Zugriff nötig.

Eigene Galerieaufnahmen und Browserdaten sind nicht Bestandteil des Repositorys. Die Galerie bleibt im jeweiligen Browser und auf dem jeweiligen Ursprung gespeichert.

## GitHub Pages als Alternative

1. Repository auf GitHub anlegen und diesen Quellstand hochladen.
2. Im Repository unter **Settings → Pages → Build and deployment → Source** die Option **GitHub Actions** wählen.
3. Unter **Actions → Publish GitHub Pages → Run workflow** den Workflow auf dem Branch `main` starten.
4. Nach erfolgreichem Lauf die ausgegebene Pages-Adresse öffnen.

Der Workflow veröffentlicht ausschließlich `dist/`. Er startet bewusst manuell; ein Push als reine Quellcodesicherung veröffentlicht noch keine neue Webseite. Zum späteren Aktualisieren erneut **Run workflow** ausführen.

Bei einem öffentlichen Repository `DavePorkins/UnderstandingCameras` ist die übliche Pages-Adresse `https://daveporkins.github.io/UnderstandingCameras/`. Diese Adresse wäre neu; sie ersetzt oder übernimmt die Adresse unter `chatgpt.site` nicht. Die endgültige Adresse steht im erfolgreichen Deployment.

Die relativen Dateipfade funktionieren auch unter einem Repository-Unterpfad. Die `.nojekyll`-Datei und die QR-Bibliothek sind enthalten. Freigabelinks werden aus der tatsächlich geöffneten Adresse erzeugt.

## Lokal prüfen

```sh
python -m http.server 8000 --directory dist
npm install
npm test
npm run test:ui
```

Dann `http://localhost:8000` öffnen. Testabhängigkeiten werden nur für die Entwicklung benötigt; sie werden nicht mit der Webseite ausgeliefert. Die Tests bestehen aus 76 Modellprüfungen plus Parameterkombinationen und 30 DOM-/Komponentengruppen. Browserprüfungen der Seminarfassung sind im Projektarbeitsordner dokumentiert.
