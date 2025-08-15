# A11y-Testseiten (noindex, unlisted path)

Dieses Paket ist für GitHub Pages vorbereitet, mit:
- `robots.txt` am Root: **Disallow: /** (keine Indexierung)
- Auf **jeder Seite**: `<meta name="robots" content="noindex,nofollow,noarchive">`
- Inhalte liegen **unter** `/tests-0568d0/` (nicht verlinkter, zufälliger Pfad). Teilen Sie nur den **Direktlink** zu `/tests-0568d0/index.html`.

## Deployment (GitHub Pages)
1. Neues Repository erstellen (öffentlich reicht).
2. **Alle Dateien** aus diesem Ordner ins Repo hochladen (Root).
3. In **Settings → Pages**: „Deploy from a branch“, Branch `main`, Folder `/ (root)`.
4. Die erreichbare URL lautet:
   - `https://<ihr-name>.github.io/<repo>/tests-0568d0/`

## Hinweis
- Kein echter Zugangsschutz – nur reduzierte Auffindbarkeit. Für echte Auth bitte andere Hoster/Pläne nutzen.
