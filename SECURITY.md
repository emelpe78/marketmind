# Sicherheit

## Meldung von Schwachstellen

Wenn du eine Sicherheitslücke in MarketMind entdeckst, melde sie **nicht** als öffentliches Issue.

**Bevorzugt:** [GitHub Private Security Advisories](https://github.com/emelpe78/marketmind/security/advisories/new) (Repository → **Security** → **Report a vulnerability**)

**Alternativ per E-Mail:** **lettau.poelchen@emelpe.de**

Bitte gib an:

- Art der Schwachstelle
- Schritte zur Reproduktion
- Betroffene Version / Commit
- Mögliche Auswirkungen

Wir antworten in der Regel innerhalb von einigen Werktagen und stimmen mit dir einen verantwortungsvollen Disclosure-Zeitplan ab.

## Bekannte Grenzen

- MarketMind ist ein **lokales Single-User-Tool** ohne Authentifizierung — betreibe es nicht ungeschützt im öffentlichen Internet.
- API-Keys werden verschlüsselt in SQLite gespeichert (AES-256-GCM, Schlüsseldatei `.settings-key` neben der DB). Sichere den Datenbankordner entsprechend.
- Scraping von eBay.de und Kleinanzeigen.de kann rechtliche und betriebliche Risiken bergen — siehe [README.md](README.md#rechtlicher-hinweis-zum-scraping).
