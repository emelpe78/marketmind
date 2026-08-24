# MarketMind

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.4.0-green)](https://github.com/emelpe78/marketmind/releases/tag/v0.4.0)

**MarketMind** ist ein lokales Open-Source-Reseller-Tool für [eBay.de](https://www.ebay.de) und [Kleinanzeigen.de](https://www.kleinanzeigen.de). Die App läuft auf deinem Rechner, speichert Daten in SQLite und verbindet sich optional mit einer KI über OpenRouter oder einen lokalen Server (z. B. Ollama).

> **Lizenz:** [MIT](LICENSE) · Mitwirkung: [CONTRIBUTING.md](CONTRIBUTING.md) · Agent-Guide: [AGENTS.md](AGENTS.md)

## Inhaltsverzeichnis

- [Schnellstart](#schnellstart)
- [Was MarketMind kann](#was-marketmind-kann)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Erste Schritte](#erste-schritte)
- [Konfiguration](#konfiguration)
- [Mit und ohne KI](#mit-und-ohne-ki)
- [Projektstruktur](#projektstruktur)
- [Entwicklung & Tests](#entwicklung--tests)
- [Fehlerbehebung](#fehlerbehebung)
- [Rechtlicher Hinweis zum Scraping](#rechtlicher-hinweis-zum-scraping)
- [Lizenz & Status](#lizenz--status)

## Schnellstart

Nach dem Klonen liegt die **Nuxt-App** im Unterordner `marketmind/` — alle `npm`-Befehle werden dort ausgeführt.

```bash
git clone https://github.com/emelpe78/marketmind.git
cd marketmind/marketmind

cp .env.example .env
npm install
npm run dev
```

Öffne **http://127.0.0.1:5666**, gehe zu **Einstellungen → API** und trage einen KI-Provider ein. Danach kannst du unter **Preisrecherche** eine erste Suche starten.

| Umgebung         | Port               | Start                                       |
| ---------------- | ------------------ | ------------------------------------------- |
| Entwicklung      | 5666               | `npm run dev` in `marketmind/`              |
| Docker           | 5667               | `docker compose up -d --build` im Repo-Root |
| Production-Build | 3000 (oder `PORT`) | `npm run build && npm run start`            |

## Was MarketMind kann

MarketMind unterstützt den **Einkauf und Wiederverkauf** gebrauchter Artikel auf eBay und Kleinanzeigen. Das **Dashboard** fasst Kennzahlen zu Recherchen, Flipping-Analysen, Anzeigen, Watchlist, Inventar und KI-Nutzung zusammen. **Preisrecherche** scrapt Marktpreise, wertet sie per KI aus und speichert Snapshots inklusive Analyse serverseitig. **Flipping** bewertet einzelne Anzeigen per URL; **Anzeigen** generiert und verwaltet Verkaufstexte; **Watchlist** und **Inventar** tracken Angebote bzw. Einkauf, Verkauf und Gewinn.

**Workflow-Übergänge** verbinden die Bereiche direkt (z. B. Recherche → Anzeige, Watchlist → Flipping, Flip/Inventar → Anzeige oder Inventar). Bei KI und Scraping zeigt ein **Statusbalken** Fortschritt und Meldung.

Navigation: **Dashboard**, **Preisrecherche**, **Anzeigen**, **Flipping**, **Inventar**, **Watchlist**, **Agents**, **Einstellungen** — mit Submenüs für Recherche, Anzeigen, Flipping und Agents (Feature-Agents, Prompt-Bibliothek, KI-Verlauf).

## Voraussetzungen

| Komponente        | Version                      |
| ----------------- | ---------------------------- |
| Node.js           | ≥ 20                         |
| npm               | ≥ 10                         |
| Docker (optional) | aktuelle Version mit Compose |

Für `npm install` wird **better-sqlite3** kompiliert — unter Linux/macOS können Build-Tools nötig sein (Python, `make`, C++-Compiler). Im Docker-Image sind diese bereits enthalten.

Für **KI-Funktionen** brauchst du einen [OpenRouter](https://openrouter.ai)-Account mit API-Key oder einen lokalen OpenAI-kompatiblen Server (z. B. [Ollama](https://ollama.com), LM Studio). Details unter [Mit und ohne KI](#mit-und-ohne-ki).

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

**Zwei `.env`-Dateien** sind nötig:

```bash
git clone https://github.com/emelpe78/marketmind.git
cd marketmind

cp .env.example .env                        # Repo-Root: Host-Datenordner
cp marketmind/.env.example marketmind/.env  # App: Datenbankpfad, optional MM_LOCAL_AI_HOST

docker compose up -d --build
```

| Datei              | Zweck                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `.env` (Repo-Root) | `MARKETMIND_DATA_DIR` — Host-Ordner für SQLite und `.settings-key` |
| `marketmind/.env`  | `MM_DATABASE_DOCKER`, optional `MM_LOCAL_AI_HOST`                  |

Die SQLite-Datei liegt im Container unter `/app/data/marketmind.db`. Auf dem Host findest du sie in `MARKETMIND_DATA_DIR` (Standard `./data/marketmind.db`).

Die App ist erreichbar unter **http://127.0.0.1:5667**.

**Lokale KI unter Docker:** Trägst du in den Einstellungen `127.0.0.1` als KI-URL ein, leitet MarketMind die Anfrage im Container an den Host weiter (`host.docker.internal`). Der KI-Server muss von außen erreichbar sein (z. B. bei LM Studio den Netzwerk-Server aktivieren). Abweichender Host optional über `MM_LOCAL_AI_HOST` in `marketmind/.env`.

Container stoppen:

```bash
docker compose down
```

### Variante C: Production-Build ohne Docker

```bash
cd marketmind/marketmind
cp .env.example .env
npm install
npm run build
npm run start
```

Standardmäßig startet der Server auf Port **3000** (Nitro-Default), sofern `PORT` nicht gesetzt ist. Für einen festen Port:

```bash
PORT=5666 node .output/server/index.mjs
```

## Erste Schritte

1. **App öffnen** — Dev: Port 5666, Docker: Port 5667.
2. **Dashboard prüfen** — KPI-Karten zeigen den Datenstand; ohne KI-Provider erscheint ein Hinweis.
3. **KI einrichten** — **Einstellungen → API**: OpenRouter (API-Key + Modell) oder lokale KI (URL + Modellname). Einstellungen werden in SQLite gespeichert, nicht in `.env`.
4. **Scraper prüfen** (optional) — **Einstellungen → Scraper**: Delay, Cache und Ergebnislimit anpassen.
5. **Erste Recherche** — **Preisrecherche**: Suchbegriff eingeben, Plattform wählen, Ergebnis und KI-Analyse prüfen.
6. **Weitere Bereiche** — Gespeicherte Recherchen unter **Preisrecherche → Gespeicherte Recherchen**; Flipping per Anzeigen-URL; Inventar und Watchlist auch ohne KI nutzbar.

## Konfiguration

Die meisten Einstellungen liegen in der App unter **Einstellungen** (SQLite), nicht in `.env`. Die `.env` steuert vor allem den **Datenbankpfad**; der Dev-Server läuft fest auf Port **5666**.

### Umgebungsvariablen

**`marketmind/.env`** (aus `marketmind/.env.example`):

| Variable             | Standard                  | Beschreibung                               |
| -------------------- | ------------------------- | ------------------------------------------ |
| `MM_DATABASE_DEV`    | `data/marketmind.db`      | SQLite-Pfad für Dev (relativ oder absolut) |
| `MM_DATABASE_DOCKER` | `/app/data/marketmind.db` | SQLite-Pfad im Docker-Container            |
| `MM_LOCAL_AI_HOST`   | `host.docker.internal`    | Optional: Hostname für lokale KI in Docker |

**`.env` im Repo-Root** (nur Docker, aus `.env.example`):

| Variable              | Standard | Beschreibung                            |
| --------------------- | -------- | --------------------------------------- |
| `MARKETMIND_DATA_DIR` | `./data` | Host-Ordner, gemountet nach `/app/data` |

Unter Docker setzt `docker-compose.yml` zusätzlich `MM_RUNTIME=docker`, `PORT` und `HOST`.

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

Der **Pfad** wird nur über `marketmind/.env` gesetzt (`MM_DATABASE_DEV` bzw. `MM_DATABASE_DOCKER`). Fehlt die Datei am konfigurierten Ort, legt MarketMind sie beim Start an.

Unter **Einstellungen → Datenbank** kannst du:

- die Datenbank als **SQL sichern** (Download),
- ein SQL-Backup **importieren** (ersetzt alle Daten — vorher Backup empfohlen),
- die Datenbank **zurücksetzen** (löscht alle Daten, Standard-Agents und -Einstellungen werden neu angelegt).

Dev-Daten liegen standardmäßig in `marketmind/data/` (nicht versioniert). Docker-Daten im Host-Ordner `MARKETMIND_DATA_DIR` — Datei `marketmind.db` plus `.settings-key` daneben.

## Mit und ohne KI

| Bereich                               | Ohne KI | Mit KI |
| ------------------------------------- | ------- | ------ |
| Dashboard, Inventar, Watchlist        | ✓       | ✓      |
| Scraper / Rohdaten einer Recherche    | ✓       | ✓      |
| KI-Marktanalyse (Recherche, Flipping) | —       | ✓      |
| Anzeigen-Generator                    | —       | ✓      |
| Prompt-Generator (Agents)             | —       | ✓      |

Ohne konfigurierten Provider kannst du MarketMind also für Inventar, Watchlist und reine Preissammlung nutzen; für Analysen und Textgenerierung ist ein KI-Provider nötig.

## Projektstruktur

```
marketmind/           # Repository-Root
├── AGENTS.md         # Anleitung für Mitwirkende & KI-Agenten
├── CONTEXT.md        # Domänensprache & Modul-Begriffe
├── CHANGELOG.md
├── .env.example      # Docker: MARKETMIND_DATA_DIR (Host-Datenordner)
├── docker-compose.yml
└── marketmind/       # Nuxt-App — npm-Befehle hier ausführen
    ├── .env.example  # MM_DATABASE_DEV / MM_DATABASE_DOCKER
    ├── app/          # Frontend (Pages, Composables, Components)
    ├── shared/       # Formatierung, Plattform-Erkennung, Preisparser
    ├── server/       # API-Routen, Use-Cases, Repositories, SQLite
    └── test/         # Unit- & E2E-Tests
```

Die Architektur folgt einer klaren Schichtung: **Routes** (HTTP mit Zod-Validierung) → **Use-Cases** → **Repositories** (SQL pro Domäne) → **Shared** (Typen und Pure Functions). Details in [AGENTS.md](AGENTS.md) und [CONTEXT.md](CONTEXT.md).

## Entwicklung & Tests

```bash
cd marketmind/marketmind

npm run dev          # Dev-Server (Port 5666)
npm run test:run     # Unit- & API-Tests
npm run test:e2e     # Playwright (baut vorher)
npx nuxi typecheck   # TypeScript-Prüfung
```

Weitere Hinweise für Mitwirkende: [AGENTS.md](AGENTS.md) · Domänenbegriffe: [CONTEXT.md](CONTEXT.md)

## Fehlerbehebung

| Problem                                         | Mögliche Ursache                              | Lösung                                                                    |
| ----------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------- |
| `npm install` schlägt bei `better-sqlite3` fehl | Fehlende Build-Tools                          | Python, `make` und C++-Compiler installieren (macOS: Xcode CLI Tools)     |
| Docker startet nicht                            | Fehlende `.env`                               | Beide Dateien anlegen: Repo-Root `.env` und `marketmind/.env`             |
| Keine eBay-Ergebnisse / HTTP 403                | Plattform blockiert Scraping                  | Kein Installationsfehler — Delay erhöhen, später erneut versuchen         |
| KI-Anfragen schlagen unter Docker fehl          | Lokaler Server nicht vom Container erreichbar | Netzwerk-Server am KI-Tool aktivieren; `MM_LOCAL_AI_HOST` prüfen          |
| Port bereits belegt                             | Andere Instanz läuft                          | Dev (5666) und Docker (5667) nicht gleichzeitig auf demselben Port nutzen |
| Dashboard zeigt „KI nicht konfiguriert“         | Kein Provider in Einstellungen                | **Einstellungen → API** — Key/URL und Modell eintragen                    |

## Rechtlicher Hinweis zum Scraping

MarketMind ruft öffentlich zugängliche Seiten von **eBay.de** und **Kleinanzeigen.de** automatisiert ab, um Preisinformationen zu sammeln. **Du bist selbst dafür verantwortlich**, dass deine Nutzung mit geltendem Recht und den Nutzungsbedingungen der jeweiligen Plattformen vereinbar ist.

**Wichtige Punkte:**

- Die **AGB und Nutzungsbedingungen** von eBay und Kleinanzeigen können automatisiertes Auslesen (Scraping, Crawling, Bots) **untersagen oder einschränken**. Verstöße können zu Sperren, IP-Blocks oder rechtlichen Schritten führen.
- MarketMind ist ein **Open-Source-Werkzeug** für den persönlichen Gebrauch (MIT-Lizenz). Es ist nicht vom Betreiber von eBay oder Kleinanzeigen autorisiert oder unterstützt.
- **eBay** kann automatische Anfragen blockieren (z. B. HTTP 403). Die App kann dann keine Ergebnisse liefern — das ist kein Fehler der Installation, sondern eine Schutzmaßnahme der Plattform.
- Bei **Kleinanzeigen** werden in der Regel nur **Angebotspreise** erfasst, keine tatsächlichen Verkaufspreise. Die KI weist in Analysen darauf hin, wenn die Datenlage eingeschränkt ist.
- Scraping kann **personenbezogene Daten** (z. B. in Anzeigentiteln oder Standortangaben) berühren. Verarbeite solche Daten nur, wenn du dazu berechtigt bist, und beachte die **DSGVO**.
- Die Entwickler von MarketMind **übernehmen keine Haftung** für Schäden, die durch die Nutzung des Scrapings entstehen — einschließlich Kontosperren, rechtlicher Auseinandersetzungen oder fehlerhafter Kauf-/Verkaufsentscheidungen.
- **Keine Rechtsberatung:** Dieser Hinweis ersetzt keine individuelle rechtliche Beratung. Bei Unsicherheit solltest du die AGB der Plattformen prüfen oder rechtlichen Rat einholen.

Nutze **moderate Abfragefrequenzen** (einstellbarer Delay), cache Ergebnisse und belaste die Plattformen nicht unnötig.

## Lizenz & Status

- **Version:** 0.4.0 — siehe [CHANGELOG.md](CHANGELOG.md)
- **Lizenz:** [MIT](LICENSE)
- **Mitwirkung:** [CONTRIBUTING.md](CONTRIBUTING.md) · [AGENTS.md](AGENTS.md) · **Issues:** [GitHub Issues](https://github.com/emelpe78/marketmind/issues)
