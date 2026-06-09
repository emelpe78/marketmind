# Changelog

Alle wesentlichen Änderungen an MarketMind werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [0.1.1] — 2026-06-09

Architektur-Refactoring: klare Schichten (Routes, Use-Cases, Repositories, Shared), einheitliche KI- und Scraping-Pipeline, Frontend-Composables.

### Hinzugefügt

- **CONTEXT.md** — Domänensprache und Modul-Begriffe für Architektur-Reviews
- **`shared/`** — plattformübergreifende Pure Functions (Formatierung, Plattform-Erkennung, `parseGermanPrice`, Agent-Formatierung)
- **SettingsStore** — `server/database/settings.ts` (Laufzeit-Konfiguration getrennt von `seed.ts`)
- **DatabaseLifecycle** — `server/database/lifecycle.ts` für Relocate, Reset und Pfad-Info
- **ScraperRuntime** — `server/services/scraper/runtime.ts` mit pro-Instanz-Throttle und gemeinsamer Session
- **RunAgent** — `server/services/ai/run-agent.ts` als einheitlicher KI-Use-Case (`required` / `optional` / `skip`)
- **ResearchRun** — `server/services/research/run-research.ts` und `POST /api/research/run`
- **Domain-Repositories** — SQL + Row-Mapping für Inventar, Watchlist, Agents, Listings, Searches, Prompt-Library
- **Dashboard-Summary** — `server/services/dashboard/summary.ts`
- **Frontend-Composables** — `useInventory`, `useWatchlist`, `useSettings`, `useListings`, `useAgents`
- Charakterisierungs- und Unit-Tests für `runAgent`, `runResearch`, `parseGermanPrice`, `ScraperRuntime`, API-Routen

### Geändert

- **AGENTS.md** — Schichten-Konvention (Routes / Use-Cases / Repositories / Shared / Composables)
- API-Routen sind dünne HTTP-Adapter; Geschäftslogik in Services
- Preisrecherche-Frontend nutzt `/api/research/run` statt mehrerer Client-Orchestrierungs-Calls
- `generate-prompt` protokolliert KI-Aufrufe in `agent_history`
- Preisstatistik-Histogramm liefert numerische Bucket-Grenzen (`low` / `high`) statt formatierter Strings
- Inventar-UI nutzt Server-`profit` als Source of Truth
- 74 Unit-Tests (Vitest), 26 Testdateien

### Entfernt

- Scraper-Proxy-Einstellungen aus `DEFAULT_SETTINGS` und `FetcherConfig` (nie implementiert)

### Behoben

- Duplizierte KI-Orchestrierung und divergierende `isAiConfigured` / `assertAiConfigured`-Logik über `runAgent` vereinheitlicht
- Vier separate deutsche Preisparser durch `parseGermanPrice` konsolidiert
- `scrapeWatchlistItem` nutzt `checkAlert()` statt inline-Bedingung
- Server-Imports von `app/utils` auf `shared/` umgestellt (keine Cross-Layer-Kopplung mehr)

## [0.1.0] — 2026-06-09

Erstes Release von **MarketMind** — lokales Reseller-Tool für Marktpreisrecherche, Flipping-Kalkulation und KI-gestützte Anzeigen auf eBay.de und Kleinanzeigen.de.

### Hinzugefügt

- **README.md** — Installationsanleitung (Dev, Docker, Production), Konfiguration und rechtlicher Hinweis zum Scraping
- **AGENTS.md** — Anleitung für KI-Agenten und Mitwirkende (Architektur, Konventionen, Tests)

#### Dashboard

- KPI-Übersicht: gespeicherte Recherchen, Watchlist-Alerts, Gesamtgewinn, Token-Kosten
- Hinweis zur KI-Provider-Konfiguration nach erstem Start oder Datenbank-Reset
- Liste gespeicherter Recherchen mit Bearbeiten und Löschen (mit Bestätigung)
- Letzte Suchen und Schnellzugriff auf Preisrecherche, Anzeigen und Flipping

#### Preisrecherche

- Scraper für eBay.de (verkaufte Artikel) und Kleinanzeigen.de (aktive Angebote)
- Preisstatistiken: Minimum, Maximum, Durchschnitt, Median
- KI-Marktanalyse pro Plattform mit Markdown-Ausgabe
- Recherchen speichern und unter `/research/saved/[id]` erneut aufrufen
- Sortierbare Ergebnistabelle mit Plattform- und Zustandsangaben

#### Anzeigen-Generator

- Plattform-Tabs für Kleinanzeigen und eBay
- KI-generierte Titel, Beschreibungen, Preisvorschläge und Kategorien
- Inline-Editor mit Copy-to-Clipboard
- Gespeicherte Anzeigen: anlegen, laden, bearbeiten und löschen (mit Bestätigung)

#### Flipping-Kalkulator

- Live-Berechnung von Netto-Erlös, Rohgewinn, Marge und Flipping-Score
- Bewertungsstufen von „Sehr lohnenswert“ bis „Nicht empfehlenswert“
- Optionale KI-Empfehlung über den Analytics Agent

#### Watchlist

- Artikel per Titel, URL und Zielpreis hinzufügen
- Plattform-Erkennung aus der URL (eBay / Kleinanzeigen)
- Manuelles und globales Preis-Update per Scraper
- Preisalarm bei Erreichen des Zielpreises mit visueller Hervorhebung
- Bearbeiten und Löschen mit Bestätigungsdialog

#### Inventar

- Artikel erfassen mit Einkaufspreis, Datum und Plattform
- Verkauf erfassen per Modal (Verkaufspreis, Plattform, Datum)
- Automatische Gewinn-/Verlustberechnung
- Übersicht: Gesamtgewinn, Durchschnittsmarge, bester und schlechtester Flip
- Löschen mit Bestätigungsdialog

#### Agent-Manager

- Vier vordefinierte Agents: Research, Listing, Analytics, Strategy
- Bearbeitung von Name, Modell, System-Prompt und Temperatur
- System-Prompt-Generator mit Speicherung in der Prompt-Bibliothek
- Anzeige von Aufrufanzahl, Token-Verbrauch und Kosten pro Agent
- Verlauf der letzten KI-Anfragen

#### Einstellungen

- KI-Provider: OpenRouter oder lokale OpenAI-kompatible API (z. B. Ollama, LM Studio)
- Verschlüsselte Speicherung von API-Keys (AES-256-GCM)
- Scraper-Konfiguration: Delay, Cache-TTL, maximale Ergebnisse
- Datenbankpfad konfigurierbar, Verschieben mit Kopie, Zurücksetzen mit Bestätigung
- Theme-Umschaltung: Hell, Dunkel, System

#### Docker

- `Dockerfile` und `docker-compose.yml` für Production-Betrieb auf **Port 5667**
- Persistentes Daten-Volume (`marketmind-data`) getrennt von der Dev-Instanz (5666)
- Healthcheck über `/api/health`
- npm-Scripts: `docker:build`, `docker:up`, `docker:down`

#### Entwicklung

- Graphify-Wissensgraph (Cursor-Regel `.cursor/rules/graphify.mdc`, Ausgabe unter `graphify-out/`)

#### Technik

- Nuxt 4 SPA mit @nuxt/ui v4, SQLite (better-sqlite3) und Nitro-Server-Routen
- Deutsche Zahlenformatierung für Euro (`1.000,00 €`) und Prozent (`33,33 %`)
- Versionsanzeige in der Sidebar (`v. 0.1.0` aus `package.json`)
- Alle Tests unter `marketmind/test/` (E2E in `test/e2e/`)
- 56 Unit-Tests (Vitest) und 18 E2E-Tests (Playwright)
- Zentrale `.gitignore` im Repo-Root

### Geändert

- E2E-Tests von `marketmind/e2e/` nach `marketmind/test/e2e/` verschoben
- Playwright-Artefakte unter `test/test-results/` und `test/playwright-report/`

### Behoben

- TypeScript-Fehler im gesamten Projekt (`nuxi typecheck` ohne Fehlermeldungen)
- Lesbarkeit des Buttons im KI-Hinweis auf dem Dashboard (Kontrast auf Warning-Alert)
- Strikte Null-Checks bei Array-, Regex- und Record-Zugriffen (u. a. `render-markdown.ts`, Scraper, Preisanalyse)

[Unreleased]: https://github.com/emelpe78/marketmind/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/emelpe78/marketmind/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/emelpe78/marketmind/releases/tag/v0.1.0
