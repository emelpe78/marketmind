# Mitwirken an MarketMind

Danke für dein Interesse an MarketMind! Dieses Projekt ist Open Source (MIT). Kurzüberblick für Mitwirkende:

## Voraussetzungen

- Node.js ≥ 20, npm ≥ 10
- Build-Tools für `better-sqlite3` (Python, make, C++-Compiler)

Details: [README.md](README.md) · Architektur: [AGENTS.md](AGENTS.md) · Domänenbegriffe: [CONTEXT.md](CONTEXT.md)

## Lokale Entwicklung

```bash
git clone https://github.com/emelpe78/marketmind.git
cd marketmind/marketmind
cp .env.example .env
npm install
npm run dev
```

Dev-Server: **http://127.0.0.1:5666**

## Tests

```bash
cd marketmind
npm run test:run
npm run test:e2e      # baut vorher
npx nuxi typecheck
```

## Pull Requests

1. **Issue** anlegen oder bestehendes Issue referenzieren (Bug, Feature, Diskussion).
2. **Branch** von `main` erstellen (`feature/…`, `fix/…`).
3. **Änderungen** klein halten — eine logische Einheit pro PR.
4. **Tests** für geändertes Verhalten ergänzen oder anpassen.
5. **Deutsch** für UI-Texte und nutzerorientierte Doku beibehalten.
6. **Keine Secrets** committen (`.env`, API-Keys, `.settings-key`, lokale DBs).

## Code-Konventionen

- Schichtung: Routes → Use-Cases → Repositories → Shared (siehe [AGENTS.md](AGENTS.md))
- Zod-Validierung an API-Grenzen
- Löschen nur mit Bestätigungsmodal
- Formatierung: `formatEuro()`, `formatDateTime()` aus `shared/`

## Changelog

Wesentliche Änderungen werden in [CHANGELOG.md](CHANGELOG.md) dokumentiert (Keep a Changelog, SemVer). Der Maintainer pflegt Release-Einträge beim Version-Bump.

## Fragen

- [GitHub Issues](https://github.com/emelpe78/marketmind/issues) für Bugs und Feature-Wünsche
- [GitHub Discussions](https://github.com/emelpe78/marketmind/discussions) für allgemeine Fragen (sofern aktiviert)
