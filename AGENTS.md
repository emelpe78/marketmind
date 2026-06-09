# MarketMind — Agent Guide

Lokales Reseller-Tool für **eBay.de** und **Kleinanzeigen.de**: Preisrecherche, Flipping, Anzeigen, Watchlist, Inventar, KI-Agents. UI auf **Deutsch**, Version **0.1.3**.

## Repository-Layout

```
marketmind/                 # Repo-Root
├── AGENTS.md               # Diese Datei
├── CONTEXT.md              # Domänensprache & Modul-Begriffe
├── CHANGELOG.md
├── docker-compose.yml      # Production-Container (Port 5667)
└── marketmind/             # Nuxt-App (Arbeitsverzeichnis für npm)
    ├── app/                # Pages, Components, Composables, Layouts
    ├── shared/             # Plattformübergreifende Pure Functions
    ├── server/             # Nitro API, Services, SQLite
    ├── test/               # Vitest + Playwright (e2e unter test/e2e/)
    ├── Dockerfile
    └── package.json
```

**Wichtig:** `npm`-Befehle immer in `marketmind/` ausführen. Docker-Compose vom Repo-Root.

## Stack

| Schicht   | Technologie                                  |
| --------- | -------------------------------------------- |
| Framework | Nuxt 4 (SPA, `ssr: false`)                   |
| UI        | @nuxt/ui v4, Tailwind, Lucide Icons          |
| DB        | SQLite via better-sqlite3 (kein ORM)         |
| KI        | OpenRouter oder lokale OpenAI-kompatible API |
| Scraping  | Cheerio + Nitro fetch                        |
| Tests     | Vitest (Unit/API), Playwright (E2E)          |

## Ports & Umgebungen

| Umgebung | Port     | Befehl                             |
| -------- | -------- | ---------------------------------- |
| Dev      | **5666** | `npm run dev`                      |
| Docker   | **5667** | `docker compose up -d` (Repo-Root) |

Env-Variablen: `MM_PORT`, `MM_DATABASE_PATH`, `PORT`, `HOST` — siehe `marketmind/.env.example`.

Dev-DB: `marketmind/data/` (gitignored). Docker-DB: Volume `marketmind-data` unter `/app/data/`.

## Architektur

### Schichten-Konvention

| Schicht          | Ort                                                                                 | Aufgabe                                        |
| ---------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Routes**       | `server/api/`                                                                       | HTTP-Adapter (Validierung, Statuscodes)        |
| **Use-Cases**    | `server/services/ai/run-agent.ts`, `research/run-research.ts`, `scraper/runtime.ts` | Geschäftslogik                                 |
| **Repositories** | `server/services/*/repository.ts`                                                   | SQL + Row-Mapping pro Domäne                   |
| **Shared**       | `shared/`                                                                           | Formatierung, Plattform-Erkennung, Preisparser |
| **Composables**  | `app/composables/`                                                                  | Frontend-State & API-Aufrufe                   |

### Frontend (`marketmind/app/`)

- **Pages:** file-based routing unter `app/pages/`
- **Composables:** `useResearch`, `useFlipping`, `useDashboard`, `useInventory`, `useWatchlist`, `useSettings`, `useListings`, `useAgents`, `useDatabaseAdmin`
- **Agents-UI:** `/agents/feature-agents` (Konfiguration), `/agents/prompt-generator` (Bibliothek + Generator), `/agents/history` (KI-Verlauf); Submenu in `default.vue`
- **Layout:** `app/layouts/default.vue` — Sidebar mit Agents-Submenu, Theme-Toggle, Versionsbadge
- **KI-Analyse-UI:** `ResearchAnalysisSummary` + `AnalysisSectionTabs` (vertikale Tabs); Markdown über `app/utils/render-markdown.ts` (`parseMarkdownSections`, erlaubte HTML-Tags)
- **Utils:** Re-Exports aus `shared/`; `render-markdown.ts` bleibt app-lokal
- Keine Pinia-Stores — State über Composables, `useFetch`, `ref`, `reactive`
- **Datenrefresh:** stabile Keys in `app/utils/fetch-keys.ts`; nach Mutationen `refreshNuxtData` über `app/utils/refresh-fetch-data.ts` — **Speichern = alle relevanten Stellen aktualisieren** (z. B. `refreshAgentsData()` für Agents + Bibliothek + Verlauf)

### Backend (`marketmind/server/`)

- **API:** `server/api/**/*.ts` — dünne HTTP-Adapter
- **Services:** Use-Cases + Repositories unter `server/services/`
- **DB:** `server/database/` — Schema, `settings.ts`, `lifecycle.ts`, `seed.ts`
- **Plugin:** `server/plugins/database.ts` — Init, Seed, Migrationen, Agent-Prompt-Sync beim Start
- **Prompt-Bibliothek:** `server/services/prompt-library/` — Repository, Zuweisung (`assign.ts`), Sync aus `agents` (`agent-sync.ts`)

### KI-Konfiguration

- Nur über **Einstellungen** (SQLite `settings`), nicht über `.env`
- Provider: `openrouter` | `local` — Routing in `server/services/ai/config.ts`
- API-Keys verschlüsselt (AES-256-GCM, `.settings-key` neben DB)
- `isAiConfigured()` steuert z. B. Dashboard-Hinweis und optionale KI-Features

### Wissensgraph (graphify)

Vor Architekturfragen: `graphify-out/GRAPH_REPORT.md` und `graphify-out/wiki/index.md` lesen. Nach Code-Änderungen: `graphify update .` (siehe `.cursor/rules/graphify.mdc`).

## Konventionen

### Sprache & Formatierung

- **UI-Texte:** Deutsch
- **Euro:** `formatEuro()` / `formatEuroDelta()` — `de-DE` (`1.000,00 €`)
- **Prozent:** `formatPercent()` — `de-DE` (`33,33 %`)
- **Datum/Uhrzeit:** `formatDateTime()` / `formatDate()` aus `shared/format-datetime.ts` für SQLite-`DATETIME` (UTC); sonst `toLocaleDateString("de-DE")` / `toLocaleString("de-DE")`

### TypeScript

- `noUncheckedIndexedAccess` beachten: Array-/Regex-Zugriffe explizit prüfen (`rows[1]`, `match?.[1]`)
- Konkrete Interfaces statt `Record<string, unknown>` für Formulare/Modals
- `npx nuxi typecheck` vor größeren Änderungen

### UI (@nuxt/ui)

- Tabellen: keine horizontale Scrollbar — `table-fixed`, Spaltenbreiten in `meta.class`, Textumbruch
- **Löschen:** immer mit Bestätigungsmodal (`UModal` + Abbrechen/Löschen)
- Buttons auf farbigen Alerts: `color="neutral" variant="solid"` (nicht `outline` auf Warning)
- E2E-relevante Elemente: `data-testid` setzen

### API & Daten

- Validierung mit Zod wo sinnvoll
- SQLite-Pfad konfigurierbar; Reset behält Pfad, löscht Daten
- Agent-Aufrufe in `agent_history` loggen (Tokens, Kosten)

### Git

- Nur committen/pushen wenn explizit angefragt
- Eine `.gitignore` im Repo-Root (nicht in `marketmind/`)

## Tests

```bash
cd marketmind
npm run test:run          # Vitest (Unit + API)
npm run test:e2e          # Playwright (baut vorher)
npx nuxi typecheck        # TypeScript
```

Alle Tests unter `marketmind/test/` — E2E in `test/e2e/`. Playwright-Artefakte: `test/test-results/`.

## Häufige Aufgaben

| Aufgabe            | Ort                                                                               |
| ------------------ | --------------------------------------------------------------------------------- |
| Neue API-Route     | `server/api/<name>.<method>.ts`                                                   |
| Neue Seite         | `app/pages/<route>.vue`                                                           |
| Scraper-Logik      | `server/services/scraper/`                                                        |
| DB-Schema          | `server/database/schema.sql` + Seed anpassen                                      |
| Formatierung       | `shared/format-*.ts` wiederverwenden                                              |
| Einstellungen-Keys | `server/database/settings.ts`, Settings-UI                                        |
| KI-Aufruf          | `server/services/ai/run-agent.ts`                                                 |
| Preisrecherche     | `server/services/research/run-research.ts`                                        |
| Prompt-Bibliothek  | `server/services/prompt-library/`, `server/api/prompt-library/`                   |
| Agent-Seed/Namen   | `server/database/seed.ts`, `server/database/migrations.ts`                        |
| Default-Agents     | Research, Listing, Flipping (`analytics`), Prompt (`strategy`, Meta-Agent)        |
| Fetch-Keys         | `app/utils/fetch-keys.ts` — `useFetch`-Keys für geteilten Cache                   |
| UI nach Speichern  | `app/utils/refresh-fetch-data.ts` — `refreshAgentsData`, `refreshAllFetchData`, … |
| Agent-Prompt-Docs  | `docs/listing_agent.md`, `docs/flipping_agent.md`                                 |

## Was vermeiden

- Keine API-Keys in `.env` oder Commits
- Kein ORM einführen
- Keine englischen UI-Strings ohne Anlass
- Kein direktes Löschen ohne Bestätigungsdialog
- Keine neuen README/CHANGELOG-Dateien ohne Anfrage
- Scope klein halten — keine unnötigen Abstraktionen oder Tests für triviales Verhalten

## Referenzen

- Releases: `CHANGELOG.md`
- Env-Vorlage: `marketmind/.env.example`
