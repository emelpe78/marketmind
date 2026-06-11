# Changelog

Alle wesentlichen Änderungen an MarketMind werden in dieser Datei dokumentiert.

Das Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [0.3.4] — 2026-06-10

KI- und Scraping-Feedback mit Statusbalken; korrekte Token-Kosten und Provider im Agent-Verlauf.

### Hinzugefügt

- **KI-Statusbalken** — `AiStatusBar`, `useAiStatus`, `shared/ai-status.ts`; Fortschrittsbalken und Schritt-Meldungen bei Preisrecherche (Suche + KI-Analyse), Flipping, Anzeigen-Generator, Prompt-Generator und Watchlist-Scraping
- **Agent-Verlauf Provider** — Spalte `provider` in `agent_history` (Migration); Anzeige in `/agents/history` über `formatAiProvider()`
- **Tests** — `test/composables/use-ai-status.test.ts`

### Geändert

- **Statusbalken-Platzierung** — pro Seite unter Eingabe bzw. Aktion statt global im Layout
- **OpenRouter-Kosten** — `chatCompletion` nutzt `usage.cost` aus der API-Antwort

### Behoben

- **Token-Kosten bei lokaler KI** — Kosten werden auf `0` gesetzt und nicht mehr aus Token-Anzahl geschätzt; OpenRouter ohne `usage.cost` ebenfalls `0` statt falscher Schätzung

## [0.3.3] — 2026-06-10

Verkaufte Inventar-Artikel lassen sich nachträglich bearbeiten.

### Hinzugefügt

- **Inventar bearbeiten** — Button „Bearbeiten“ für verkaufte Artikel auf `/inventory`; Modal mit Titel, Einkauf, Verkauf und Notizen (`app/pages/inventory.vue`)

### Geändert

- **E2E Inventar** — `test/e2e/inventory.spec.ts` prüft Bearbeitung nach Verkauf; stabilere zeilenbasierte Selektoren

## [0.3.2] — 2026-06-10

Docker: lokale KI (Ollama, LM Studio) auf dem Host ist aus dem Container erreichbar.

### Geändert

- **`resolveLocalAiBaseUrl()`** — bei `MM_RUNTIME=docker` werden `127.0.0.1`, `localhost` und `::1` in der lokalen KI-URL auf `host.docker.internal` umgeschrieben (`server/services/ai/config.ts`)
- **`docker-compose.yml`** — `extra_hosts: host.docker.internal:host-gateway` für Host-Zugriff aus dem Container (auch Linux)
- **`.env.example`** — optional `MM_LOCAL_AI_HOST` für abweichenden KI-Host unter Docker

### Behoben

- **Lokale KI in Docker** — Flipping-Analyse, Preisrecherche und andere KI-Aufrufe schlagen nicht mehr mit `ECONNREFUSED 127.0.0.1` fehl, wenn der KI-Server auf dem Host läuft

## [0.3.1] — 2026-06-10

Datenbank-Administration: SQL-Backup/Restore in den Einstellungen und robustere Docker-Pfadbehandlung.

### Hinzugefügt

- **SQL-Backup** — `GET /api/database/backup` exportiert Schema und Daten als `.sql`-Datei (`server/database/sql-transfer.ts`)
- **SQL-Restore** — `POST /api/database/restore` importiert ein SQL-Backup per Multipart-Upload; bei Fehler wird eine frische DB wiederhergestellt
- **Einstellungen → Datenbank** — Buttons „Als SQL sichern“ und „SQL importieren“ (mit Bestätigungsmodal)
- **`useDatabaseAdmin`** — `downloadSqlBackup()`, `restoreDatabaseFromSql()`
- **Tests** — `test/database/sql-transfer.test.ts`, `test/database/paths.test.ts`, `test/api/database-backup-restore.test.ts`

### Geändert

- **`DatabasePaths`** — Host-Pfade in `MM_DATABASE_DOCKER` werden im Container auf `/app/data` gemappt; `ensureDatabasePath()` legt fehlende DB-Dateien beim Start an
- **`.env.example`** — Hinweise zu `MARKETMIND_DATA_DIR` und Host-Pfaden (z. B. Nextcloud) für Docker

## [0.3.0] — 2026-06-10

Feature-übergreifende Workflows: mit einem Klick von Recherche, Flipping, Watchlist und Inventar in den nächsten Reseller-Schritt wechseln — ohne Copy-Paste.

### Hinzugefügt

- **WorkflowHandoff** — `shared/workflow-handoff.ts` mit Route-Buildern (`buildListingsRoute`, `buildFlipRoute`), Query-Parsern und Prefill aus Flip/Inventar
- **WorkflowHandoffBanner** — Hinweis auf Zielseiten nach Übergang (`app/components/WorkflowHandoffBanner.vue`)
- **Inventar-Prefill Flip/Watchlist** — `buildInventoryPrefillFromFlipListing()`, `buildInventoryPrefillFromWatchlist()` in `shared/inventory-prefill.ts`
- **Listing-Marktstats aus Snapshots** — `resolveListingMarketStats()` nutzt `searchId`, `savedResearchId` oder `savedFlipAnalysisId` beim Anzeigen-Generator
- **Workflow-Buttons** — „Anzeige erstellen“, „Flipping analysieren“, „Ins Inventar“ auf Recherche, Flipping, Watchlist und Inventar
- **E2E** — `test/e2e/workflow-handoff.spec.ts` für Query-Prefill und Watchlist-Guards

### Geändert

- **`useListings`** — Handoff-State (`searchId`, `savedResearchId`, `savedFlipAnalysisId`, `applyHandoff()`); `/listings` liest Query-Parameter beim Laden
- **`/flipping`** — URL-Prefill aus Watchlist-Handoff (`?url=…&from=watchlist`)
- **`InventoryCreateModal`** — zusätzlich auf `/flipping`, `/flipping/analyses/[id]` und `/watchlist`
- **`POST /api/listings/generate`** — optionale Body-Felder `savedResearchId`, `savedFlipAnalysisId`

## [0.2.2] — 2026-06-10

Architektur-Deepening: tiefere Domänen-Module, einheitliche HTTP-Seams, Workflow-Composables und Flipping-Speichern ohne Doppel-Scrape.

### Hinzugefügt

- **`JsonRow`** — `parseJsonColumn()` für gespeicherte JSON-Snapshots (`server/services/persistence/json-row.ts`)
- **`EMPTY_PRICE_STATS`** — zentrale leere Preisstatistik in `shared/price-stats.ts`
- **`ApiSchemas/common`** — gemeinsames `priceStatsSchema`, `titleUpdateBodySchema`
- **`MarketContext`** — `scrapeMarketContext()` für Marktvergleich mit optionaler Persistence (`server/services/scraper/market-context.ts`)
- **`ListingDetailTypes`** — `ListingDetail` in `shared/listing-detail-types.ts`; `FlipListingInfo` ist Alias
- **`shared/listings-types.ts`** — Listing-Typen und `toListingCreatePayload()`
- **`SavedResearchListItem`** — schlanke Listen-API für gespeicherte Recherchen
- **Workflow-Composables** — `useResearch` und `useListings` tragen UI-State und Workflow-Logik
- **`createSavedFlipAnalysisFromResult()`** — Speichern aus Analyse-Ergebnis ohne Re-Scrape
- **`findPricedResultsForPlatform()`** — einheitlicher Zugriff auf `search_results` im searches-Repository
- **`listSavedFlipAnalysisItems()` / `listSavedResearchItems()`** — schlanke GET-Listen

### Geändert

- **Flipping speichern** — `useSavedFlipAnalyses.saveFromResult()` → `POST /api/saved-flip-analyses` mit vollem Analyse-Payload (kein Doppel-Scrape)
- **Flipping-Marktvergleich** — keine Orphan-Einträge in `searches` (in-memory Stats via `scrapeMarketContext({ persist: false })`)
- **Watchlist-Scraper** — nutzt `parseListingDetailHtml` statt isolierter Preis-Extraktion
- **HTTP-Mutations-Routen** — `defineApiHandler` + Zod für Listings-Generate, Watchlist, Agents, Prompt-Library, Settings, Database-Reset u. a.
- **Research-API** — totes `analyses`-Request-Feld entfernt
- **`analyze-search`** — kein direktes SQL; `PlatformAnalysis` = `ResearchRunSummary`

### Entfernt

- **`POST /api/saved-flip-analyses/from-url`** — ersetzt durch Speichern aus Analyse-Ergebnis (Breaking)

## [0.2.1] — 2026-06-10

Architektur-Refactor: klarere Schichten, serverseitige Speicher-Flows für KI-Daten, einheitliche API-Validierung und geteilte Typen.

### Hinzugefügt

- **`defineApiHandler`** — einheitlicher HTTP-Seam mit Zod-Validierung, Domain-Error-Mapping und Scraper-502-Handling (`server/utils/api-handler.ts`)
- **Zod-Schemas** — `server/api/schemas/` für Research, Flipping, Inventar, Listings
- **Shared API-Typen** — `shared/research-types.ts`, `shared/flipping-types.ts`, `shared/inventory-types.ts`, `shared/price-stats.ts`
- **`PromptResolution`** — `resolveActiveAgentPrompt()`; Bibliotheks-Prompt hat Vorrang vor `agents.system_prompt` (`server/services/agents/prompt-resolve.ts`)
- **`PromptBuilder`** — domänenspezifische KI-User-Prompts in `server/services/*/prompts.ts` (Research, Flipping, Listings)
- **`searches.analyses_json`** — KI-Analysen werden serverseitig zwischen Analyze- und Save-Schritt gespeichert
- **`POST /api/saved-flip-analyses/from-url`** — Flipping-Analyse speichern ohne Client-Blob-Re-POST
- **Domain-Refresh-Bundles** — `refreshResearchData()`, `refreshFlippingData()`, `refreshListingsData()`, `refreshInventoryData()`
- **`shared/inventory-prefill.ts`** — `buildInventoryPrefillFromListing()` für Übernahme aus gespeicherten Anzeigen
- **`price-extract.ts`** — gemeinsame Preis-Extraktion für ListingDetailParser und Watchlist
- **Repository `count*`-Methoden** — Dashboard-KPIs über Domänen-Repositories statt Ad-hoc-SQL

### Geändert

- **`ScraperRuntime`** — `scrapeSearch()` liefert nur Ergebnisse; Persistence in `searches/repository.ts` (`persistScrapeSearch`, …)
- **Preisrecherche speichern** — `analyses` nicht mehr vom Client; Speichern nur nach vorheriger KI-Analyse (Button disabled ohne Analyse)
- **Flipping speichern** — `useSavedFlipAnalyses.saveFromUrl()` statt vollem Analyse-Blob vom Browser
- **`DashboardSummary`** — komponiert `count*`-Aufrufe aus Repositories
- **Composables** — importieren geteilte Typen statt lokaler Duplikate; Inventar ohne `Record<string, unknown>`

### Entfernt

- **`server/services/flipping/calculator.ts`** — Re-Export-Shim (Legacy `FlippingCalculator` bleibt in `shared/`)

## [0.2.0] — 2026-06-10

Einheitliches Inventar-Anlegen per Modal und Kartenlisten in Inventar sowie gespeicherten Anzeigen.

### Hinzugefügt

- **`InventoryCreateModal`** — globales Modal zum Anlegen von Inventar-Items (Titel, Einkauf, Ziel-Verkauf, Plattformen, Notizen); optional mit `prefill` und `titleSuffix`

### Geändert

- **Inventar-UI** — Inline-Formular durch Button „Artikel hinzufügen“ und `InventoryCreateModal` ersetzt; Artikelliste als Kartenlayout wie bei gespeicherten Anzeigen (Badges, Notizen-Vorschau, Metadaten)
- **Gespeicherte Anzeigen** — „Ins Inventar aufnehmen“ nutzt dasselbe Modal statt eigener Implementierung
- **Listen-Abstände** — mehr Abstand (`mt-3`) zwischen Beschreibung/Notizen und Metadatenzeile in Inventar und gespeicherten Anzeigen

## [0.1.7] — 2026-06-10

Dashboard mit gruppierten KPI-Karten und Agent-Übersicht; Datenbankpfad ausschließlich über `.env`; Docker-Speicherort per Host-Bind-Mount statt benanntem Volume.

### Hinzugefügt

- **Dashboard-KPI-Karten** — Abschnitte Recherche & Tools, Inventar, Agents und KI & Nutzung mit Icon-Boxen
- **`DashboardKpiCard`** — Wrapper mit optionaler `NuxtLink`-Navigation bei vorhandenen Daten
- **`shared/agent-icons.ts`** — Lucide-Icons pro Agent-Typ (`research`, `listing`, `analytics`, `strategy`)
- **Agent-Cards auf dem Dashboard** — Aufrufe, Kosten und Feature-Zuordnung pro Feature-Agent
- **Flip-Highlights** — Bester und schlechtester Flip als KPI-Karten (wenn Inventardaten vorhanden)
- **Docker Bind-Mount** — `MARKETMIND_DATA_DIR` in Repo-Root `.env.example`; Host-Ordner wird nach `/app/data` gemountet
- **`MM_DATABASE_DEV` / `MM_DATABASE_DOCKER`** — getrennte Env-Keys für Dev und Docker; Auswahl über `MM_RUNTIME=docker`

### Geändert

- **Dashboard-API** — `getDashboardSummary` liefert Zähler (Recherchen, Analysen, Anzeigen, Watchlist, Inventar, Prompt-Bibliothek) und Agent-Stats statt Listen/„Letzte Suchen“
- **Dashboard-Karten** — Verlinkung zu passenden Routen (z. B. `/research/saved`, `/flipping/analyses`, `/watchlist`, `/inventory`, `/agents/history`, `/settings`)
- **`useDashboard`** — erweitertes `DashboardSummary`-Interface mit `agents`, `promptLibraryCount` und Zählfeldern
- **Sidebar-Reihenfolge** — Dashboard → Preisrecherche → Anzeigen → Flipping → Inventar → Watchlist → Agents → Einstellungen
- **docker-compose.yml** — benanntes Volume `marketmind-data` durch Host-Bind-Mount ersetzt; lädt `marketmind/.env` per `env_file`
- **Datenbankpfad** — nur noch über `marketmind/.env` (`MM_DATABASE_DEV`, `MM_DATABASE_DOCKER`); kein UI-Feld mehr
- **Einstellungen → Datenbank** — nur noch „Datenbank zurücksetzen“ (Pfad im Bestätigungsdialog)
- **Dev-Port** — fest **5666** in `nuxt.config.ts` (nicht mehr über `MM_PORT` konfigurierbar)
- **`MARKETMIND_DATA_DIR`** — neutraler Standard `./data` in `.env.example` (kein privater Pfad im Repo)

### Entfernt

- **Letzte Suchen** — Tabelle vom Dashboard entfernt
- **Docker-Volume `marketmind-data`** — durch konfigurierbaren Host-Ordner ersetzt
- **`PUT /api/database/path`** — Pfadänderung per API entfernt (`relocateDatabase`)
- **`MM_DATABASE_PATH`** — durch `MM_DATABASE_DEV` / `MM_DATABASE_DOCKER` ersetzt
- **`MM_PORT`** — aus `marketmind/.env` entfernt (Dev-Port fest in Nuxt-Konfiguration)

## [0.1.6] — 2026-06-09

Preisrecherche mit Sidebar-Submenu und eigener Seite für gespeicherte Recherchen; Marktanalyse und Ergebnisliste als aufklappbare Accordion-/Collapsible-Ansicht.

### Hinzugefügt

- **Preisrecherche-Unterseiten** — `/research` (Recherche), `/research/saved` (Gespeicherte Recherchen)
- **Preisrecherche-Submenu** — Sidebar wie bei Anzeigen, Flipping und Agents (`shared/research-nav.ts`)
- **`useSavedResearches`** — Composable für Liste, Bearbeiten und Löschen; Fetch-Key `savedResearches`
- **`ResearchAnalysisList`** — KI-Marktanalysen pro Plattform als Accordion (standardmäßig zugeklappt)
- **`ResearchResultsTable`** — Suchergebnis-Tabelle als Collapsible über „X Ergebnisse“ (standardmäßig zugeklappt)
- **`stripPlatformSuffixFromTitle()`** — Plattform in Klammern aus Analyse-Titeln entfernen (Badge bleibt)

### Geändert

- **Gespeicherte Recherchen** — eigene Seite statt Liste auf dem Dashboard; KPI-Zähler auf dem Dashboard bleibt
- **Einzelansicht** — Zurück-Link zeigt auf `/research/saved` statt Dashboard
- **ResearchAnalysisSummary** — Titel ohne Plattform-Suffix in Klammern

### Behoben

- **Accordion-Inhalt** — KI-Analyse-Tabs werden wieder korrekt im aufgeklappten Panel angezeigt (Slot-Zuordnung)

## [0.1.5] — 2026-06-09

Anzeigen-Bereich in Generator und gespeicherte Liste aufgeteilt; Bearbeitung und Inventar-Übernahme per Modal; Inventar-Plattform „Sonstige“.

### Hinzugefügt

- **Anzeigen-Unterseiten** — `/listings` (Generator), `/listings/saved` (Gespeicherte Anzeigen)
- **Anzeigen-Submenu** — Sidebar wie bei Flipping und Agents (`shared/listings-nav.ts`)
- **Bearbeitungs-Modal** — gespeicherte Anzeigen auf `/listings/saved` bearbeiten (ohne Query-Parameter)
- **Inventar aus Anzeige** — Button „Ins Inventar aufnehmen“ mit vorausgefülltem Modal (Titel, Ziel-Verkaufspreis, Plattform, Notizen)
- **Inventar-Plattform „Sonstige“** — Einkaufs- und Verkaufsplattform zusätzlich zu Kleinanzeigen und eBay (`INVENTORY_PLATFORM_SELECT_OPTIONS`, `normalizeInventoryPlatform()`)
- **`category` in `listings`** — Spalte in `schema.sql` plus Migration für bestehende Datenbanken

### Geändert

- **Gespeicherte Anzeigen** — eigene Seite statt Liste unter dem Generator
- **Listings-API** — `POST`/`PUT` `/api/listings` übernehmen `category`; Speichern inkl. Kategorie aus KI-Generierung

### Behoben

- **Anzeigen speichern** — SQLite-Fehler `table listings has no column named category` bei neuen/gespeicherten Anzeigen

## [0.1.4] — 2026-06-09

Flipping-Kalkulator neu: KI-Analyse per Anzeigen-URL, gespeicherte Analysen, Sidebar-Submenu.

### Hinzugefügt

- **Flipping per URL** — Anzeigen-URL (eBay / Kleinanzeigen) scrapen, Marktvergleich, KI-Bewertung durch Flipping Agent (`mode: required`)
- **Listing-Detail-Parser** — `server/services/scraper/listing-detail.ts` für Anzeigen-Seiten
- **Gespeicherte Flipping-Analysen** — Tabelle `saved_flip_analyses`, API `/api/saved-flip-analyses` (CRUD)
- **Flipping-Unterseiten** — `/flipping` (Kalkulator), `/flipping/analyses` (Liste), `/flipping/analyses/[id]` (Detail mit Tab-Ansicht)
- **Flipping-Submenu** — Sidebar wie bei Agents (`shared/flipping-nav.ts`, Icon `i-lucide-banknote`)
- **Composable** — `useSavedFlipAnalyses`; Fetch-Key `savedFlipAnalyses`
- **`isListingUrl()`** — in `shared/detect-platform.ts`
- Tests für Listing-Parser, gespeicherte Analysen, erweiterte `analyzeFlip`- und Scraper-URL-Sanitisierung

### Geändert

- **Flipping-Kalkulator** — manuelle Eingabe (Einkauf, Verkauf, Versand, Verpackung) und Live-Score entfernt; Ausgabe über `ResearchAnalysisSummary` + `AnalysisSectionTabs`
- **Flipping Agent** — Auslöser „Flipping analysieren“; KI jetzt erforderlich (`shared/agent-usage.ts`)
- **Kleinanzeigen-Such-URLs** — Sonderzeichen (`/`, `+`, …) in Suchbegriffen werden bereinigt (keine HTTP-400 durch `%2F`)
- **Marktsuche** — bei Scraper-Fehler Fallback: Analyse nur mit Anzeigendaten; `ScraperFetchError` in Flipping-API wie bei Research

### Entfernt

- Alter Flipping-Flow mit manueller Margen-Eingabe und optionalem KI-Button „KI-Empfehlung“

## [0.1.3] — 2026-06-09

Agent-Manager in Unterseiten aufgeteilt, Prompt-Bibliothek mit Agent-Zuordnung, Sync zwischen Feature-Agents und Bibliothek.

### Hinzugefügt

- **Agent-Unterseiten** — `/agents/feature-agents`, `/agents/prompt-generator`, `/agents/history` (Redirect von `/agents`)
- **Sidebar-Submenu** — „Agents“ mit Feature-Agents, System-Prompt-Generator, Verlauf (`shared/agent-nav.ts`)
- **Feature-Zuordnung** — pro Agent-Karte: Feature, Auslöser, KI-Modus (`shared/agent-usage.ts`)
- **Prompt-Bibliothek (CRUD)** — Anzeigen, Bearbeiten, Löschen (mit Bestätigung); Agent-Dropdown in Tabelle und Modals
- **Agent-Zuordnung** — optional ein Prompt pro Agent (`agent_id`); neue Zuweisung ersetzt die bisherige (Hinweis in UI)
- **Agent-Prompt-Sync** — Feature-Agent-Prompts erscheinen in der Bibliothek (`server/services/prompt-library/agent-sync.ts`); Zuweisung schreibt in `agents.system_prompt`
- **Meta-Agent (Prompt Agent)** — Badge auf der Feature-Agents-Seite; fester Generator-Prompt im Code (`shared/agent-meta.ts`, `shared/agent-prompt.ts`)
- **`shared/format-datetime.ts`** — SQLite-UTC-Zeitstempel korrekt als lokale `de-DE`-Zeit
- **`shared/prompt-library-agents.ts`** — Agent-Dropdown-Optionen und Zuordnungs-Hinweise
- DB-Migrationen — `agent_id` in `prompt_library`, Unique-Index pro Agent, Kategorie entfernt, Agent-Umbenennungen
- Tests für Prompt-Bibliothek, Agent-Sync, Datumsformatierung und Agent-Renames

### Geändert

- **Agent-Namen** — „Analytics Agent“ → **Flipping Agent** (`analytics`), „Strategy Agent“ → **Prompt Agent** (`strategy`); Migration für bestehende DBs
- **Prompt Agent** — im System-Prompt-Generator zuweisbar; `generateAgentPrompt` nutzt `resolveAgentPromptText()` (DB-Prompt oder Code-Fallback)
- **Prompt Agent** — auf Feature-Agents nicht bearbeitbar (Meta-Agent); Flipping/Research/Listing weiterhin per Modal
- **System-Prompt-Generator** — ausführlicher Meta-Prompt, Temperatur fest `0.2`
- **Agent-Verlauf** — eigene Seite mit Agent-Namen in der Tabelle
- **Composables** — nach Speichern/Löschen/KI-Aufruf werden verknüpfte Daten mitaktualisiert (z. B. Inventar/Watchlist → Dashboard, KI-Features → Agent-Verlauf + Token-Kosten, DB-Reset → alle Keys)
- **Frontend-Datenrefresh** — stabile `useFetch`-Keys (`app/utils/fetch-keys.ts`) und zentrale Invalidierung über `refreshNuxtData` (`app/utils/refresh-fetch-data.ts`); nach Mutationen werden abhängige Views sofort aktualisiert (ohne Seiten-Reload)
- **Agent-Prompt-Dokumentation** — Referenz-Prompts für Listing und Flipping Agent unter `docs/`

### Behoben

- **Zeitstempel** — `created_at` aus SQLite wurde ohne UTC-Konvertierung angezeigt (falsche lokale Uhrzeit)
- **Prompt-Bibliothek / Agents-UI** — gespeicherte Prompts und Zuordnungen erschienen erst nach Reload; `saveAgent` aktualisierte die Bibliothek in der UI nicht (fehlendes gemeinsames Refresh von Agents + Bibliothek)

### Entfernt

- **Kategorie** — Spalte und UI-Feld in der Prompt-Bibliothek

## [0.1.2] — 2026-06-09

Architektur-Vertiefung: Shared-Seams, Use-Case-Module für KI-Features, Domain-Errors, konsolidierte Repositories, Frontend-Composables für Haupt-Flows.

### Hinzugefügt

- **`shared/platform-labels.ts`** — zentrale UI-Labels und Plattform-Select-Optionen
- **`shared/flipping-calculator.ts`** — gemeinsame Margen-/Score-Logik für Client und Server
- **KI-Use-Cases** — `generateListing`, `analyzeFlip`, `generateAgentPrompt`
- **Domain-Errors** — `server/services/errors.ts` mit HTTP-Mapping in Routes
- **Watchlist-Alerts** — `server/services/watchlist/alerts.ts` (entkoppelt vom Scraper)
- **Frontend-Composables** — `useResearch`, `useFlipping`, `useDashboard`, `useDatabaseAdmin`
- Tests für Research-API, Dashboard-Summary, Watchlist-Scrape, KI-Use-Cases

### Geändert

- **Agent-Manager** — alle Agent-SQL-Funktionen in `server/services/agents/repository.ts`
- **ResearchRun** — Stats/Results über `searches/repository` statt dupliziertem SQL
- **Preisrecherche** — einziger API-Einstieg `POST /api/research/run` (+ `saved-researches`)
- Routes für Listings, Flipping und Prompt-Generierung sind dünne Adapter über Use-Cases
- Inventar-Server nutzt `shared/detect-platform` für `normalizePlatform`
- Watchlist-Scrape-Routes nutzen Repository statt inline SQL
- **KI-Marktanalyse** — Abschnitte (`###`) in vertikalen Tabs (`AnalysisSectionTabs`: Navigation links, Inhalt rechts)
- **`render-markdown.ts`** — `parseMarkdownSections()` für strukturiertes Tab-Rendering; erlaubte HTML-Tags (`<small>`, `<br>`) in KI-Ausgaben

### Behoben

- Gespeicherte Recherchen enthielten keine KI-Analyse, wenn Analyse und Speichern in getrennten API-Schritten erfolgten (`analyses` werden beim Speichern mit übergeben)
- HTML-Tags in KI-Markdown (z. B. `<small>` für Datenbasis-Hinweise) wurden escaped statt gerendert

### Entfernt (Breaking)

- `/api/searches/*` und `/api/search-results/*` (verwaist, durch `/api/research/run` ersetzt)
- `/api/openrouter/chat` (ohne `agent_history`, ungenutzt)
- `server/services/scraper/index.ts` (Pass-through-Fassade)
- `server/services/database/admin.ts` (Reexport)
- `server/services/openrouter/agents.ts` (nach Agent-Konsolidierung)

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

- KI-Provider: OpenRouter oder lokale OpenAI-kompatible API (z. B. Ollama, LM Studio)
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
- Strikte Null-Checks bei Array-, Regex- und Record-Zugriffen (u. a. `render-markdown.ts`, Scraper, Preisanalyse)

[Unreleased]: https://github.com/emelpe78/marketmind/compare/v0.3.4...HEAD
[0.3.4]: https://github.com/emelpe78/marketmind/compare/v0.3.3...v0.3.4
[0.3.3]: https://github.com/emelpe78/marketmind/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/emelpe78/marketmind/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/emelpe78/marketmind/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/emelpe78/marketmind/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/emelpe78/marketmind/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/emelpe78/marketmind/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/emelpe78/marketmind/compare/v0.1.7...v0.2.0
[0.1.7]: https://github.com/emelpe78/marketmind/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/emelpe78/marketmind/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/emelpe78/marketmind/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/emelpe78/marketmind/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/emelpe78/marketmind/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/emelpe78/marketmind/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/emelpe78/marketmind/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/emelpe78/marketmind/releases/tag/v0.1.0
