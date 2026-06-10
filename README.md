# MarketMind

**MarketMind** ist ein lokales Reseller-Tool für [eBay.de](https://www.ebay.de) und [Kleinanzeigen.de](https://www.kleinanzeigen.de). Die App läuft auf deinem Rechner, speichert Daten in SQLite und verbindet sich optional mit einer KI über OpenRouter oder einen lokalen Server (z. B. Ollama).

> **Hinweis:** Das Projekt ist derzeit noch nicht als Open Source veröffentlicht. Die Lizenz wird vor dem Release festgelegt.

## Was MarketMind kann

Das **Dashboard** gibt dir auf einen Blick Kennzahlen zu gespeicherten Recherchen, Flipping-Analysen, Anzeigen, Watchlist, Inventar und KI-Nutzung — mit direkten Links zu den jeweiligen Bereichen, sobald Daten vorhanden sind. MarketMind hilft beim **Einkaufen und Wiederverkaufen** gebrauchter Artikel: Du recherchierst Marktpreise per Scraper, lässt die Ergebnisse von einer KI auswerten (Abschnitte wie Preisübersicht und Marktbewertung in einer Tab-Ansicht) und speicherst Recherchen inklusive KI-Analyse für später — die Analyse wird dabei serverseitig zwischengespeichert, nicht im Browser mitgeschickt. Unter **Preisrecherche → Gespeicherte Recherchen** findest du alle Snapshots; in der Detailansicht klappst du Marktanalysen pro Plattform und die Ergebnisliste per Klick auf. Der **Flipping-Kalkulator** bewertet per KI das Potenzial einer konkreten eBay- oder Kleinanzeigen-Anzeige (URL eingeben → Analyse in Tabs → optional speichern, serverseitig). Unter **Flipping-Analysen** findest du gespeicherte Auswertungen wieder. Der **Anzeigen-Generator** erstellt plattformgerechte Texte für eBay und Kleinanzeigen; unter **Gespeicherte Anzeigen** verwaltest du Texte, bearbeitest sie im Modal und kannst sie per gemeinsamem Dialog ins **Inventar** übernehmen. Mit der **Watchlist** beobachtest du einzelne Angebote und erhältst Preisalarme; im **Inventar** legst du Artikel über dasselbe Modal an, verwaltest sie in einer Kartenliste und trackst Einkauf, Verkauf und Gewinn (Plattformen: Kleinanzeigen, eBay, Sonstige).

Die Sidebar führt von oben nach unten durch **Dashboard**, **Preisrecherche**, **Anzeigen**, **Flipping**, **Inventar**, **Watchlist**, **Agents** und **Einstellungen**. Preisrecherche, Anzeigen, Flipping und Agents haben jeweils ein Submenu (z. B. Recherche / Gespeicherte Recherchen, Generator / Gespeicherte Anzeigen, Kalkulator / Analysen, Feature-Agents / System-Prompt-Generator / KI-Verlauf). Der Agent-Manager umfasst **Feature-Agents** (Research, Listing, Flipping, Prompt Agent), die **Prompt-Bibliothek** (CRUD, optionale Agent-Zuordnung — ein Prompt pro Agent) und den **KI-Verlauf**. Änderungen an Agents, Prompts und Zuordnungen erscheinen sofort in der UI — ohne manuellen Reload.

Referenz-System-Prompts für Listing und Flipping Agent: [`docs/listing_agent.md`](docs/listing_agent.md), [`docs/flipping_agent.md`](docs/flipping_agent.md).

## Voraussetzungen

| Komponente        | Version                      |
| ----------------- | ---------------------------- |
| Node.js           | ≥ 20                         |
| npm               | ≥ 10                         |
| Docker (optional) | aktuelle Version mit Compose |

Für die **KI-Funktionen** brauchst du entweder einen [OpenRouter](https://openrouter.ai)-Account mit API-Key oder einen lokalen OpenAI-kompatiblen Server (z. B. [Ollama](https://ollama.com), LM Studio). Ohne KI-Provider funktionieren Scraper, Watchlist und Inventar; Analysen und Textgenerierung nicht.

## Installation

### Variante A: Lokale Entwicklung (Port 5666)

```bash
git clone https://github.com/emelpe78/marketmind.git
cd marketmind/marketmind

cp .env.example .env
npm install
npm run dev
```

Die App ist erreichbar unter **http://127.0.0.1:5666**.

### Variante B: Docker (Port 5667)

Docker läuft getrennt von der Dev-Instanz auf einem eigenen Port. Persistente Daten liegen in einem Host-Ordner (Bind-Mount nach `/app/data` im Container).

```bash
git clone https://github.com/emelpe78/marketmind.git
cd marketmind

cp .env.example .env   # MARKETMIND_DATA_DIR setzen (z. B. ./data oder Cloud-Ordner)
docker compose up -d --build
```

Die SQLite-Datei liegt im Container unter `/app/data/marketmind.db` (`MM_DATABASE_DOCKER` in `marketmind/.env`). Den Host-Ordner steuerst du über `MARKETMIND_DATA_DIR` in der Repo-Root `.env`.

Die App ist erreichbar unter **http://127.0.0.1:5667**.

Container stoppen:

```bash
docker compose down
```

### Variante C: Production-Build ohne Docker

```bash
cd marketmind/marketmind
npm install
npm run build
npm run start
```

Standardmäßig startet der Server auf Port **3000** (Nitro-Default), sofern `PORT` nicht gesetzt ist. Für einen festen Port:

```bash
PORT=5666 node .output/server/index.mjs
```

## Erste Schritte nach der Installation

1. **App im Browser öffnen** (5666 für Dev, 5667 für Docker).
2. Auf dem Dashboard siehst du KPI-Karten und ggf. einen Hinweis, wenn noch kein KI-Provider konfiguriert ist.
3. Gehe zu **Einstellungen** und richte API sowie optional Scraper und Datenbank ein.
4. Starte eine **Preisrecherche** unter `/research`, um Scraper und KI zu testen.

## Konfiguration

Die meisten Einstellungen werden in der App unter **Einstellungen** gespeichert (SQLite), nicht in `.env`. Die `.env` steuert den Datenbankpfad; der Dev-Server läuft fest auf Port **5666**.

### Umgebungsvariablen (`.env`)

Kopiere `marketmind/.env.example` nach `marketmind/.env`:

| Variable             | Standard                  | Beschreibung                               |
| -------------------- | ------------------------- | ------------------------------------------ |
| `MM_DATABASE_DEV`    | `data/marketmind.db`      | SQLite-Pfad für Dev (relativ oder absolut) |
| `MM_DATABASE_DOCKER` | `/app/data/marketmind.db` | SQLite-Pfad im Docker-Container            |

Unter Docker setzt `docker-compose.yml` zusätzlich `MM_RUNTIME=docker`, `PORT` und `HOST`. Den **Host-Datenordner** steuerst du im Repo-Root über `.env` (`MARKETMIND_DATA_DIR` — siehe `.env.example`).

| Variable (Repo-Root, Docker) | Standard | Beschreibung                            |
| ---------------------------- | -------- | --------------------------------------- |
| `MARKETMIND_DATA_DIR`        | `./data` | Host-Ordner, gemountet nach `/app/data` |

### KI-Provider (in der App)

Unter **Einstellungen → API** einen Provider wählen:

**OpenRouter**

- API-Key von [openrouter.ai](https://openrouter.ai) eintragen
- Default-Modell setzen (z. B. `deepseek/deepseek-v4-pro`)

**Lokale KI**

- OpenAI-kompatible URL (z. B. `http://127.0.0.1:11434/v1` für Ollama)
- Modellname (z. B. `llama3.2`)
- API-Key nur falls vom lokalen Server verlangt

API-Keys werden verschlüsselt in der Datenbank gespeichert (Schlüsseldatei `.settings-key` neben der DB).

### Scraper (in der App)

Unter **Einstellungen → Scraper**:

| Einstellung     | Standard  | Bedeutung                              |
| --------------- | --------- | -------------------------------------- |
| Delay Min / Max | 2–5 Sek.  | Zufällige Pause zwischen Anfragen      |
| Cache TTL       | 6 Stunden | Wiederverwendung gecachter HTML-Seiten |
| Max. Ergebnisse | 100       | Obergrenze pro Suche                   |

### Datenbank

Der **Pfad** wird nur über `marketmind/.env` gesetzt (`MM_DATABASE_DEV` bzw. `MM_DATABASE_DOCKER`). In der App unter **Einstellungen → Datenbank** kannst du die Datenbank nur noch **zurücksetzen** (löscht alle Daten, behält den Pfad; Standard-Agents und -Einstellungen werden neu angelegt).

Dev-Daten liegen standardmäßig in `marketmind/data/` (nicht versioniert). Docker-Daten im Host-Ordner `MARKETMIND_DATA_DIR`, Datei `marketmind.db` plus `.settings-key` daneben.

## Projektstruktur

```
marketmind/           # Repository-Root
├── AGENTS.md         # Anleitung für Mitwirkende & KI-Agenten
├── CONTEXT.md        # Domänensprache & Modul-Begriffe
├── CHANGELOG.md
├── .env.example      # Docker: MARKETMIND_DATA_DIR (Host-Datenordner)
├── docs/             # PRD, Agent-Prompt-Referenzen
├── docker-compose.yml
└── marketmind/       # Nuxt-App (npm-Befehle hier ausführen)
    ├── app/          # Frontend (Pages, Composables, Components)
    ├── shared/       # Formatierung, Plattform-Erkennung, Preisparser
    ├── server/       # API-Routen, Use-Cases, Repositories, SQLite
    └── test/         # Unit- & E2E-Tests
```

Die Architektur folgt einer klaren Schichtung: **Routes** (HTTP mit Zod-Validierung) → **Use-Cases** (z. B. `runAgent`, `runResearch`, `ScraperRuntime`) → **Repositories** (SQL pro Domäne) → **Shared** (Typen und Pure Functions). Details in [AGENTS.md](AGENTS.md) und [CONTEXT.md](CONTEXT.md).

## Entwicklung & Tests

```bash
cd marketmind/marketmind

npm run dev          # Dev-Server (Port 5666)
npm run test:run     # Unit- & API-Tests
npm run test:e2e     # Playwright (baut vorher)
npx nuxi typecheck   # TypeScript-Prüfung
```

Weitere Hinweise für Mitwirkende: [AGENTS.md](AGENTS.md) · Domänenbegriffe: [CONTEXT.md](CONTEXT.md)

## Rechtlicher Hinweis zum Scraping

MarketMind ruft öffentlich zugängliche Seiten von **eBay.de** und **Kleinanzeigen.de** automatisiert ab, um Preisinformationen zu sammeln. **Du bist selbst dafür verantwortlich**, dass deine Nutzung mit geltendem Recht und den Nutzungsbedingungen der jeweiligen Plattformen vereinbar ist.

**Wichtige Punkte:**

- Die **AGB und Nutzungsbedingungen** von eBay und Kleinanzeigen können automatisiertes Auslesen (Scraping, Crawling, Bots) **untersagen oder einschränken**. Verstöße können zu Sperren, IP-Blocks oder rechtlichen Schritten führen.
- MarketMind ist ein **privates Werkzeug** für den persönlichen Gebrauch. Es ist nicht vom Betreiber von eBay oder Kleinanzeigen autorisiert oder unterstützt.
- **eBay** kann automatische Anfragen blockieren (z. B. HTTP 403). Die App kann dann keine Ergebnisse liefern — das ist kein Fehler der Installation, sondern eine Schutzmaßnahme der Plattform.
- Bei **Kleinanzeigen** werden in der Regel nur **Angebotspreise** erfasst, keine tatsächlichen Verkaufspreise. Die KI weist in Analysen darauf hin, wenn die Datenlage eingeschränkt ist.
- Scraping kann **personenbezogene Daten** (z. B. in Anzeigentiteln oder Standortangaben) berühren. Verarbeite solche Daten nur, wenn du dazu berechtigt bist, und beachte die **DSGVO**.
- Die Entwickler von MarketMind **übernehmen keine Haftung** für Schäden, die durch die Nutzung des Scrapings entstehen — einschließlich Kontosperren, rechtlicher Auseinandersetzungen oder fehlerhafter Kauf-/Verkaufsentscheidungen.
- **Keine Rechtsberatung:** Dieser Hinweis ersetzt keine individuelle rechtliche Beratung. Bei Unsicherheit solltest du die AGB der Plattformen prüfen oder rechtlichen Rat einholen.

Nutze **moderate Abfragefrequenzen** (einstellbarer Delay), cache Ergebnisse und belaste die Plattformen nicht unnötig.

## Lizenz & Status

- **Version:** 0.2.1 — siehe [CHANGELOG.md](CHANGELOG.md)
- **Lizenz:** Noch nicht veröffentlicht (geplant: Open Source)
- **Issues:** [GitHub Issues](https://github.com/emelpe78/marketmind/issues)
