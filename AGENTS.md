# MarketMind — Agent Guide

Lokales Reseller-Tool für **eBay.de** und **Kleinanzeigen.de**: Preisrecherche, Flipping, Anzeigen, Watchlist, Inventar, KI-Agents. UI auf **Deutsch**, Version **0.3.5**. Domänenbegriffe: `CONTEXT.md`.

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

| Schicht   | Technologie                                    |
| --------- | ---------------------------------------------- |
| Framework | Nuxt 4 (SPA, `ssr: false`)                     |
| UI        | @nuxt/ui v4, Tailwind, Lucide + Phosphor Icons |
| DB        | SQLite via better-sqlite3 (kein ORM)           |
| KI        | OpenRouter oder lokale OpenAI-kompatible API   |
| Scraping  | Cheerio + Nitro fetch                          |
| Tests     | Vitest (Unit/API), Playwright (E2E)            |

## Ports & Umgebungen

| Umgebung | Port     | Befehl                             |
| -------- | -------- | ---------------------------------- |
| Dev      | **5666** | `npm run dev`                      |
| Docker   | **5667** | `docker compose up -d` (Repo-Root) |

Env: `MM_DATABASE_DEV`, `MM_DATABASE_DOCKER`, `MM_RUNTIME`, `PORT`, `HOST` — `marketmind/.env.example`; Dev-Port in `nuxt.config.ts`. Docker-Daten: `MARKETMIND_DATA_DIR` — Repo-Root `.env.example`. DB-Pfad nur über `.env` (Dev: `data/marketmind.db`; Docker: Bind-Mount → `/app/data/`), nicht über die UI. Reset/Backup/Restore: Einstellungen → Datenbank.

## Architektur

### Schichten-Konvention

| Schicht          | Ort                                               | Aufgabe                                       |
| ---------------- | ------------------------------------------------- | --------------------------------------------- |
| **Routes**       | `server/api/`                                     | HTTP-Adapter über `defineApiHandler` + Zod    |
| **Use-Cases**    | `server/services/{ai,research,flipping,scraper}/` | Geschäftslogik                                |
| **Repositories** | `server/services/*/repository.ts`                 | SQL + Row-Mapping pro Domäne (inkl. `count*`) |
| **Shared**       | `shared/`                                         | Typen, Formatierung, Plattform-Erkennung      |
| **Composables**  | `app/composables/`                                | Workflow-State & API-Aufrufe                  |

### Frontend (`marketmind/app/`)

| Bereich        | Routen                                                                  | Submenu (`shared/*-nav.ts`) |
| -------------- | ----------------------------------------------------------------------- | --------------------------- |
| Dashboard      | `/`                                                                     | —                           |
| Preisrecherche | `/research`, `/research/saved`, `/research/saved/[id]`                  | `research-nav`              |
| Anzeigen       | `/listings`, `/listings/saved`                                          | `listings-nav`              |
| Flipping       | `/flipping`, `/flipping/analyses`, `/flipping/analyses/[id]`            | `flipping-nav`              |
| Inventar       | `/inventory`                                                            | —                           |
| Watchlist      | `/watchlist`                                                            | —                           |
| Agents         | `/agents/feature-agents`, `/agents/prompt-generator`, `/agents/history` | `agent-nav`                 |
| Einstellungen  | `/settings` (KI, Datenbank)                                             | —                           |

- **Composables:** `useResearch`, `useSavedResearches`, `useFlipping`, `useSavedFlipAnalyses`, `useDashboard`, `useInventory`, `useWatchlist`, `useSettings`, `useListings`, `useAgents`, `useAiStatus`, `useDatabaseAdmin`, `usePageHead`
- **Layout:** `default.vue` — Sidebar wie Tabelle; Theme-Toggle, Versionsbadge, `BRAND_ICON` (`shared/brand.ts`)
- **Dashboard:** `DashboardOverview` + `DashboardKpiCard` — KPI in vier Abschnitten; `useDashboard` / `GET /api/dashboard`
- **KI-Feedback:** `AiStatusBar` + `useAiStatus` (`runWithAiStatus`); Schritte in `shared/ai-status.ts`
- **KI-Analyse-UI:** `ResearchAnalysisList`, `ResearchAnalysisSummary`, `ResearchResultsTable`, `AnalysisSectionTabs`; Markdown in `app/utils/render-markdown.ts`
- **Inventar:** Kartenliste; verkaufte Artikel bearbeitbar; `InventoryCreateModal` (prefill) auf Inventar, Listings, Flipping, Watchlist
- **Workflows:** `workflow-handoff.ts` + `WorkflowHandoffBanner` — Handoffs zwischen Features; Listing-Generate: `resolveListingMarketStats()`
- **State:** keine Pinia-Stores; Fetch-Keys `app/utils/fetch-keys.ts`; Refresh-Bundles `app/utils/refresh-fetch-data.ts`
- **Seitenmetadaten:** `usePageHead`; `titleTemplate` `%s · MarketMind` in `nuxt.config.ts`

### Backend (`marketmind/server/`)

- **API:** `server/api/**/*.ts` — dünne Adapter; Zod in `server/api/schemas/`
- **Prompt-Auflösung:** `resolveActiveAgentPrompt()` — Bibliothek vor `agents.system_prompt` (`prompt-resolve.ts`)
- **Services:** Use-Cases + Repositories unter `server/services/`
- **DB:** `server/database/` — Schema, `settings.ts`, `lifecycle.ts`, `paths.ts`, `sql-transfer.ts`, `seed.ts`
- **Plugin:** `server/plugins/database.ts` — Init, Seed, Migrationen, Agent-Prompt-Sync
- **Prompt-Bibliothek:** `server/services/prompt-library/` — CRUD, `assign.ts`, `agent-sync.ts`

### KI-Konfiguration

- Nur über **Einstellungen** (SQLite `settings`), nicht über `.env`
- Provider `openrouter` \| `local` — `server/services/ai/config.ts`; Docker: `resolveLocalAiBaseUrl()` → `host.docker.internal` (optional `MM_LOCAL_AI_HOST`)
- API-Keys verschlüsselt (AES-256-GCM, `.settings-key` neben DB)
- `isAiConfigured()` steuert Dashboard-Hinweis; Flipping und Preisrecherche-KI erfordern konfigurierte KI

### Wissensgraph (graphify)

Vor Architekturfragen: `graphify-out/GRAPH_REPORT.md` und `graphify-out/wiki/index.md`. Nach Code-Änderungen: `graphify update .` (siehe `.cursor/rules/graphify.mdc`).

## Konventionen

### Sprache & Formatierung

- **UI-Texte:** Deutsch
- **Euro/Prozent:** `formatEuro()`, `formatEuroDelta()`, `formatPercent()` — `de-DE`
- **Datum:** `formatDateTime()` / `formatDate()` aus `shared/format-datetime.ts` für SQLite-UTC

### TypeScript & UI

- `noUncheckedIndexedAccess`: Array-/Regex-Zugriffe prüfen (`match?.[1]`)
- Konkrete Interfaces statt `Record<string, unknown>`; `npx nuxi typecheck` vor größeren Änderungen
- Tabellen: `table-fixed`, keine horizontale Scrollbar; Löschen nur mit Bestätigungsmodal
- Alerts: Buttons `color="neutral" variant="solid"`; E2E: `data-testid`

### API & Daten

- Zod-Validierung; `ScraperFetchError` → 502 mit lesbarer Meldung
- Agent-Aufrufe in `agent_history` (Tokens, Kosten, Provider); lokale KI: Kosten `0`

### Git

- Nur committen/pushen wenn explizit angefragt; eine `.gitignore` im Repo-Root

## Tests

```bash
cd marketmind
npm run test:run          # Vitest (Unit + API)
npm run test:e2e          # Playwright (baut vorher)
npx nuxi typecheck        # TypeScript
```

E2E unter `test/e2e/`; Artefakte: `test/test-results/`.

## Häufige Aufgaben

| Aufgabe                 | Ort                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Neue API-Route          | `server/api/<name>.<method>.ts`                                                          |
| Neue Seite              | `app/pages/<route>.vue`                                                                  |
| API-Handler + Zod       | `server/utils/api-handler.ts`, `server/api/schemas/`                                     |
| Scraper                 | `server/services/scraper/`                                                               |
| DB-Schema / Seed        | `server/database/schema.sql`, `seed.ts`, `migrations.ts`                                 |
| Formatierung            | `shared/format-*.ts`                                                                     |
| Einstellungen           | `server/database/settings.ts`, `app/pages/settings.vue`                                  |
| KI-Aufruf               | `server/services/ai/run-agent.ts`                                                        |
| Preisrecherche          | `server/services/research/run-research.ts`, `app/pages/research/`                        |
| Gespeicherte Recherchen | `useSavedResearches`, `server/api/saved-researches/`                                     |
| Flipping                | `analyze-flip.ts`, `server/api/flipping/`, `useSavedFlipAnalyses`                        |
| Anzeigen                | `generate-listing.ts`, `server/api/listings/`, `useListings`                             |
| Inventar                | `server/services/inventory/`, `useInventory`, `InventoryCreateModal`                     |
| Watchlist               | `server/services/watchlist/`, `useWatchlist`, `app/pages/watchlist.vue`                  |
| Dashboard               | `server/services/dashboard/summary.ts`, `DashboardOverview.vue`                          |
| Prompt-Bibliothek       | `server/services/prompt-library/`, `server/api/prompt-library/`                          |
| Default-Agents          | Research, Listing, Flipping (`analytics`), Prompt (`strategy`, Meta-Agent)               |
| Shared API-Typen        | `shared/*-types.ts`, `shared/price-stats.ts`                                             |
| Workflows / Prefill     | `shared/workflow-handoff.ts`, `shared/inventory-prefill.ts`, `WorkflowHandoffBanner.vue` |
| Docker / lokale KI      | `docker-compose.yml`, `MARKETMIND_DATA_DIR`, `resolveLocalAiBaseUrl`, `MM_LOCAL_AI_HOST` |
| SQL-Backup/Restore      | `sql-transfer.ts`, `/api/database/backup`, `/api/database/restore`, `useDatabaseAdmin`   |
| Agent-Prompt-Docs       | `docs/listing_agent.md`, `docs/flipping_agent.md`                                        |

## Was vermeiden

- Keine API-Keys in `.env` oder Commits
- Kein ORM; keine englischen UI-Strings ohne Anlass
- Kein direktes Löschen ohne Bestätigungsdialog
- Keine neuen README/CHANGELOG-Dateien ohne Anfrage
- Scope klein halten — keine unnötigen Abstraktionen oder Tests für triviales Verhalten

## Referenzen

- Releases: `CHANGELOG.md`
- Env-Vorlagen: `marketmind/.env.example` (Dev), `.env.example` (Docker-Datenordner)
