# MarketMind — Domänensprache

Glossar für Architektur-Reviews und Code. Begriffe aus dem PRD plus technische Module.

## Produktbereiche

| Begriff                | Bedeutung                                                                                                                                                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preisrecherche**     | Scraper + Statistik + optionale KI-Marktanalyse für eBay.de und Kleinanzeigen.de. UI: `/research` (Recherche), `/research/saved` (Liste), `/research/saved/[id]` (Detail). KI-Analysen werden serverseitig in `searches.analyses_json` zwischengespeichert; Speichern liest daraus (nicht vom Client) |
| **Flipping**           | KI-Bewertung des Flipping-Potenzials einer **konkreten Anzeigen-URL** (eBay / Kleinanzeigen): Listing scrapen → Marktvergleich → Flipping Agent. Speicherung über `POST /api/saved-flip-analyses/from-url` (serverseitig). UI: `/flipping`, `/flipping/analyses`                                      |
| **Anzeigen-Generator** | KI-erzeugte Verkaufstexte, plattformspezifisch (eBay / Kleinanzeigen). UI: `/listings` (Generator), `/listings/saved` (gespeicherte Texte, Bearbeiten per Modal, Übernahme ins Inventar über `InventoryCreateModal`)                                                                                  |
| **Watchlist**          | Beobachtete Artikel mit Preis-Scraping und Zielpreis-Alarm                                                                                                                                                                                                                                            |
| **Inventar**           | Gekaufte/verkaufte Artikel mit Gewinn/Verlust; Kartenliste auf `/inventory`; Anlegen über `InventoryCreateModal`; Einkaufs-/Verkaufsplattform Kleinanzeigen, eBay oder **Sonstige**; Server liefert berechnetes `profit`                                                                              |
| **Agent-Manager**      | KI-Agents in drei UI-Bereichen: Feature-Agents (`/agents/feature-agents`), System-Prompt-Generator (`/agents/prompt-generator`), Verlauf (`/agents/history`); Sidebar-Submenu unter „Agents“                                                                                                          |
| **Prompt-Bibliothek**  | Gespeicherte System-Prompts mit CRUD; optionale Zuordnung zu genau einem Agent (`agent_id`); Sync mit `agents.system_prompt`                                                                                                                                                                          |
| **Dashboard**          | Startseite `/` mit KPI-Übersicht: gespeicherte Recherchen/Analysen/Anzeigen, Watchlist, Inventar, Feature-Agents, KI-Nutzung; Karten verlinken bei vorhandenen Daten zur jeweiligen Unterseite                                                                                                        |

## Vordefinierte Agents

| Anzeigename    | Typ `type`  | Einsatz                                                    | Bearbeitung Feature-Agents       |
| -------------- | ----------- | ---------------------------------------------------------- | -------------------------------- |
| Research Agent | `research`  | KI-Marktanalyse in der Preisrecherche (`mode: required`)   | Ja                               |
| Listing Agent  | `listing`   | Anzeigen-Generator (`mode: required`)                      | Ja                               |
| Flipping Agent | `analytics` | Flipping-Kalkulator per Anzeigen-URL (`mode: required`)    | Ja                               |
| Prompt Agent   | `strategy`  | System-Prompt-Generator (`mode: required`); **Meta-Agent** | Nein (Prompt in Bibliothek/Code) |

Pro Agent ist höchstens **ein** Prompt in der Bibliothek zugeordnet; eine neue Zuweisung ersetzt die bisherige.

## Technische Module

| Begriff                     | Datei                                             | Bedeutung                                                                                                                                |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **SettingsStore**           | `server/database/settings.ts`                     | Laufzeit-Konfiguration aus SQLite, inkl. verschlüsselter Secrets                                                                         |
| **ScraperRuntime**          | `server/services/scraper/runtime.ts`              | Einheitliche Scraping-Session: Throttle, Cache, User-Agent; `scrapeSearch` liefert nur Ergebnisse (Persistence über searches-Repository) |
| **ListingDetailParser**     | `server/services/scraper/listing-detail.ts`       | Anzeigen-Seiten (eBay/Kleinanzeigen) → Titel, Preis, Beschreibung, Zustand                                                               |
| **PriceExtract**            | `server/services/scraper/price-extract.ts`        | Gemeinsame Preis-Extraktion aus Listing-HTML (eBay/Kleinanzeigen); genutzt von ListingDetailParser und Watchlist                         |
| **DefineApiHandler**        | `server/utils/api-handler.ts`                     | HTTP-Seam: Zod-Validierung, `mapDomainError`, `ScraperFetchError` → 502                                                                  |
| **ApiSchemas**              | `server/api/schemas/`                             | Zod-Schemas pro Domäne (Research, Flipping, Inventar, Listings)                                                                          |
| **SharedTypes**             | `shared/*-types.ts`, `shared/price-stats.ts`      | Geteilte API-Typen für Server und Composables (Research, Flipping, Inventar)                                                             |
| **RunAgent**                | `server/services/ai/run-agent.ts`                 | KI-Use-Case: Config → Agent → Completion → History (`required` / `optional` / `skip`)                                                    |
| **PromptResolution**        | `server/services/agents/prompt-resolve.ts`        | Runtime-Seam: zugewiesener Bibliotheks-Prompt hat Vorrang, sonst `agents.system_prompt`, Meta-Agent über `resolveAgentPromptText`        |
| **PromptBuilder**           | `server/services/*/prompts.ts`                    | Domänenspezifischer KI-User-Prompt (Research, Flipping, Listings) — getrennt von System-Prompt-Auflösung                                 |
| **ResearchRun**             | `server/services/research/run-research.ts`        | Preisrecherche: Scrape → Stats → optionale Analyse (persistiert in `searches.analyses_json`) → optionales Speichern                      |
| **analyzeFlip**             | `server/services/flipping/analyze-flip.ts`        | Flipping: Listing-URL → Detail-Scrape → Marktsuche → Flipping Agent (`analytics`, `required`)                                            |
| **SavedFlipAnalysis**       | `server/services/flipping/saved-flip-analysis.ts` | CRUD für gespeicherte Flipping-Analysen (`saved_flip_analyses`)                                                                          |
| **AnalysisSectionTabs**     | `app/components/AnalysisSectionTabs.vue`          | KI-Marktanalyse: `###`-Abschnitte als vertikale Tabs (links/rechts)                                                                      |
| **ResearchAnalysisList**    | `app/components/ResearchAnalysisList.vue`         | Mehrere Plattform-Analysen als Accordion (standardmäßig zugeklappt)                                                                      |
| **ResearchResultsTable**    | `app/components/ResearchResultsTable.vue`         | Suchergebnis-Tabelle als Collapsible über „X Ergebnisse“ (standardmäßig zugeklappt)                                                      |
| **ResearchAnalysisSummary** | `app/components/ResearchAnalysisSummary.vue`      | Einzelne KI-Analyse als Card (z. B. Flipping)                                                                                            |
| **useSavedResearches**      | `app/composables/useSavedResearches.ts`           | Liste, Bearbeiten, Löschen gespeicherter Recherchen; Fetch-Key `savedResearches`                                                         |
| **MarkdownRenderer**        | `app/utils/render-markdown.ts`                    | KI-Markdown → HTML; `parseMarkdownSections`, `stripPlatformSuffixFromTitle`, erlaubte Tags (`<small>`, `<br>`)                           |
| **DashboardSummary**        | `server/services/dashboard/summary.ts`            | Aggregierte KPI-Daten für Startseite: Zähler, Inventar-Summary, Agent-Stats, Token-Kosten, KI-Status                                     |
| **DashboardOverview**       | `app/components/DashboardOverview.vue`            | KPI-Karten in Abschnitten; Flip-Highlights; Schnellzugriffe                                                                              |
| **DashboardKpiCard**        | `app/components/DashboardKpiCard.vue`             | KPI-Card mit optionalem `NuxtLink` bei gesetztem `to`                                                                                    |
| **AgentIcons**              | `shared/agent-icons.ts`                           | `getAgentIcon(type)` — Lucide-Icon pro Agent-Typ                                                                                         |
| **ResearchNav**             | `shared/research-nav.ts`                          | Sidebar-Submenu: Recherche, Gespeicherte Recherchen; `isResearchRoute()`                                                                 |
| **generateListing**         | `server/services/listings/generate-listing.ts`    | Anzeigen-Generator: Marktkontext → `RunAgent` (`listing`) → Parsing                                                                      |
| **generateAgentPrompt**     | `server/services/agents/generate-prompt.ts`       | Prompt-Generierung über Prompt Agent (`strategy`); nutzt `resolveAgentPromptText()`                                                      |
| **PromptLibrary**           | `server/services/prompt-library/`                 | CRUD, Agent-Zuordnung, Sync aus `agents`                                                                                                 |
| **AgentPromptSync**         | `server/services/prompt-library/agent-sync.ts`    | Übernimmt Feature-Agent-Prompts in die Bibliothek beim Start und nach Agent-Speichern                                                    |
| **AgentUsage**              | `shared/agent-usage.ts`                           | UI-Zuordnung: Feature, Route, Auslöser, KI-Modus pro `type`                                                                              |
| **ListingsNav**             | `shared/listings-nav.ts`                          | Sidebar-Submenu: Generator, Gespeicherte Anzeigen; `isListingsRoute()`                                                                   |
| **FlippingNav**             | `shared/flipping-nav.ts`                          | Sidebar-Submenu: Kalkulator, Analysen; `isFlippingRoute()`                                                                               |
| **AgentMeta**               | `shared/agent-meta.ts`                            | Meta-Agent-Typ (`strategy`), Generator-Prompt und Temperatur `0.2`                                                                       |
| **FormatDateTime**          | `shared/format-datetime.ts`                       | SQLite-UTC → lokale `de-DE`-Anzeige                                                                                                      |
| **FetchKeys**               | `app/utils/fetch-keys.ts`                         | Stabile `useFetch`-Cache-Keys pro API-Endpoint                                                                                           |
| **RefreshFetchData**        | `app/utils/refresh-fetch-data.ts`                 | UI-Refresh nach Mutationen; Domain-Bundles: `refreshResearchData`, `refreshFlippingData`, `refreshListingsData`, `refreshInventoryData`  |
| **InventoryPrefill**        | `shared/inventory-prefill.ts`                     | `buildInventoryPrefillFromListing()` — Prefill für `InventoryCreateModal` aus gespeicherten Anzeigen                                     |
| **DatabaseLifecycle**       | `server/database/lifecycle.ts`                    | Reset und Pfad-Info; Pfad kommt aus Env, nicht aus der UI                                                                                |
| **DatabasePaths**           | `server/database/paths.ts`                        | `resolveDbPath`, `getActivePath`, `getEnvDatabasePath()` — `MM_DATABASE_DEV` bzw. `MM_DATABASE_DOCKER` (`MM_RUNTIME=docker`)             |
| **MARKETMIND_DATA_DIR**     | Repo-Root `.env` / `docker-compose.yml`           | Host-Ordner für persistente Docker-Daten (Bind-Mount → `/app/data`; DB-Datei über `MM_DATABASE_DOCKER`)                                  |
| **Repository**              | `server/services/*/repository.ts`                 | SQL + Row-Mapping pro Domäne                                                                                                             |
| **PlatformLabels**          | `shared/platform-labels.ts`                       | UI-Labels für eBay / Kleinanzeigen / Beide (Recherche); Inventar-Optionen inkl. Sonstige (`INVENTORY_PLATFORM_SELECT_OPTIONS`)           |
| **InventoryPlatform**       | `shared/detect-platform.ts`                       | `normalizeInventoryPlatform()` — eBay, Kleinanzeigen, Sonstige (nur Inventar; URL-Erkennung unverändert)                                 |
| **InventoryCreateModal**    | `app/components/InventoryCreateModal.vue`         | Globales Modal zum Anlegen von Inventar-Items; `prefill`/`titleSuffix`; genutzt auf `/inventory` und `/listings/saved`                   |
| **FlippingCalculator**      | `shared/flipping-calculator.ts`                   | Margen-/Score-Hilfsfunktion (Legacy; nicht mehr im Flipping-UI-Flow)                                                                     |

## Schichten-Konvention

- **Routes** — HTTP-Adapter (Validierung, Statuscodes, Domain-Error-Mapping)
- **Use-Case-Module** — Geschäftslogik (`RunAgent`, `ResearchRun`, `analyzeFlip`, `generateListing`, `ScraperRuntime`)
- **Repository-Module** — SQL + Row-Mapping pro Domäne
- **Shared** — Plattformübergreifende Pure Functions (`shared/`)
- **Composables** — Frontend-State aligned mit Server-APIs (`useResearch`, `useSavedResearches`, `useFlipping`, `useSavedFlipAnalyses`, `useDashboard`, `useAgents`, …); Mutationen invalidieren verknüpfte Fetch-Keys (Speichern → sofortige UI-Aktualisierung)
