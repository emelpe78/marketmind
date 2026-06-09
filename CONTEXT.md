# MarketMind — Domänensprache

Glossar für Architektur-Reviews und Code. Begriffe aus dem PRD plus technische Module.

## Produktbereiche

| Begriff                | Bedeutung                                                                                                                                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preisrecherche**     | Scraper + Statistik + optionale KI-Marktanalyse für eBay.de und Kleinanzeigen.de. UI: `/research` (Recherche), `/research/saved` (Liste), `/research/saved/[id]` (Detail). Gespeicherte Snapshots (`saved-researches`) enthalten `analyses_json` inkl. KI-Texte |
| **Flipping**           | KI-Bewertung des Flipping-Potenzials einer **konkreten Anzeigen-URL** (eBay / Kleinanzeigen): Listing scrapen → Marktvergleich → Flipping Agent. Speicherung unter `saved_flip_analyses`. UI: `/flipping`, `/flipping/analyses`                                 |
| **Anzeigen-Generator** | KI-erzeugte Verkaufstexte, plattformspezifisch (eBay / Kleinanzeigen). UI: `/listings` (Generator), `/listings/saved` (gespeicherte Texte, Bearbeiten per Modal, Übernahme ins Inventar)                                                                        |
| **Watchlist**          | Beobachtete Artikel mit Preis-Scraping und Zielpreis-Alarm                                                                                                                                                                                                      |
| **Inventar**           | Gekaufte/verkaufte Artikel mit Gewinn/Verlust; Einkaufs-/Verkaufsplattform Kleinanzeigen, eBay oder **Sonstige**; Server liefert berechnetes `profit`                                                                                                           |
| **Agent-Manager**      | KI-Agents in drei UI-Bereichen: Feature-Agents (`/agents/feature-agents`), System-Prompt-Generator (`/agents/prompt-generator`), Verlauf (`/agents/history`); Sidebar-Submenu unter „Agents“                                                                    |
| **Prompt-Bibliothek**  | Gespeicherte System-Prompts mit CRUD; optionale Zuordnung zu genau einem Agent (`agent_id`); Sync mit `agents.system_prompt`                                                                                                                                    |

## Vordefinierte Agents

| Anzeigename    | Typ `type`  | Einsatz                                                    | Bearbeitung Feature-Agents       |
| -------------- | ----------- | ---------------------------------------------------------- | -------------------------------- |
| Research Agent | `research`  | KI-Marktanalyse in der Preisrecherche (`mode: required`)   | Ja                               |
| Listing Agent  | `listing`   | Anzeigen-Generator (`mode: required`)                      | Ja                               |
| Flipping Agent | `analytics` | Flipping-Kalkulator per Anzeigen-URL (`mode: required`)    | Ja                               |
| Prompt Agent   | `strategy`  | System-Prompt-Generator (`mode: required`); **Meta-Agent** | Nein (Prompt in Bibliothek/Code) |

Pro Agent ist höchstens **ein** Prompt in der Bibliothek zugeordnet; eine neue Zuweisung ersetzt die bisherige.

## Technische Module

| Begriff                     | Datei                                             | Bedeutung                                                                                                                      |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **SettingsStore**           | `server/database/settings.ts`                     | Laufzeit-Konfiguration aus SQLite, inkl. verschlüsselter Secrets                                                               |
| **ScraperRuntime**          | `server/services/scraper/runtime.ts`              | Einheitliche Scraping-Session: Throttle pro Instanz, Cache, User-Agent                                                         |
| **ListingDetailParser**     | `server/services/scraper/listing-detail.ts`       | Anzeigen-Seiten (eBay/Kleinanzeigen) → Titel, Preis, Beschreibung, Zustand                                                     |
| **RunAgent**                | `server/services/ai/run-agent.ts`                 | KI-Use-Case: Config → Agent → Completion → History (`required` / `optional` / `skip`)                                          |
| **ResearchRun**             | `server/services/research/run-research.ts`        | Preisrecherche: Scrape → Stats → optionale Analyse → optionales Speichern (inkl. `analyses` im Snapshot)                       |
| **analyzeFlip**             | `server/services/flipping/analyze-flip.ts`        | Flipping: Listing-URL → Detail-Scrape → Marktsuche → Flipping Agent (`analytics`, `required`)                                  |
| **SavedFlipAnalysis**       | `server/services/flipping/saved-flip-analysis.ts` | CRUD für gespeicherte Flipping-Analysen (`saved_flip_analyses`)                                                                |
| **AnalysisSectionTabs**     | `app/components/AnalysisSectionTabs.vue`          | KI-Marktanalyse: `###`-Abschnitte als vertikale Tabs (links/rechts)                                                            |
| **ResearchAnalysisList**    | `app/components/ResearchAnalysisList.vue`         | Mehrere Plattform-Analysen als Accordion (standardmäßig zugeklappt)                                                            |
| **ResearchResultsTable**    | `app/components/ResearchResultsTable.vue`         | Suchergebnis-Tabelle als Collapsible über „X Ergebnisse“ (standardmäßig zugeklappt)                                            |
| **ResearchAnalysisSummary** | `app/components/ResearchAnalysisSummary.vue`      | Einzelne KI-Analyse als Card (z. B. Flipping)                                                                                  |
| **useSavedResearches**      | `app/composables/useSavedResearches.ts`           | Liste, Bearbeiten, Löschen gespeicherter Recherchen; Fetch-Key `savedResearches`                                               |
| **MarkdownRenderer**        | `app/utils/render-markdown.ts`                    | KI-Markdown → HTML; `parseMarkdownSections`, `stripPlatformSuffixFromTitle`, erlaubte Tags (`<small>`, `<br>`)                 |
| **ResearchNav**             | `shared/research-nav.ts`                          | Sidebar-Submenu: Recherche, Gespeicherte Recherchen; `isResearchRoute()`                                                       |
| **generateListing**         | `server/services/listings/generate-listing.ts`    | Anzeigen-Generator: Marktkontext → `RunAgent` (`listing`) → Parsing                                                            |
| **generateAgentPrompt**     | `server/services/agents/generate-prompt.ts`       | Prompt-Generierung über Prompt Agent (`strategy`); nutzt `resolveAgentPromptText()`                                            |
| **PromptLibrary**           | `server/services/prompt-library/`                 | CRUD, Agent-Zuordnung, Sync aus `agents`                                                                                       |
| **AgentPromptSync**         | `server/services/prompt-library/agent-sync.ts`    | Übernimmt Feature-Agent-Prompts in die Bibliothek beim Start und nach Agent-Speichern                                          |
| **AgentUsage**              | `shared/agent-usage.ts`                           | UI-Zuordnung: Feature, Route, Auslöser, KI-Modus pro `type`                                                                    |
| **ListingsNav**             | `shared/listings-nav.ts`                          | Sidebar-Submenu: Generator, Gespeicherte Anzeigen; `isListingsRoute()`                                                         |
| **FlippingNav**             | `shared/flipping-nav.ts`                          | Sidebar-Submenu: Kalkulator, Analysen; `isFlippingRoute()`                                                                     |
| **AgentMeta**               | `shared/agent-meta.ts`                            | Meta-Agent-Typ (`strategy`), Generator-Prompt und Temperatur `0.2`                                                             |
| **FormatDateTime**          | `shared/format-datetime.ts`                       | SQLite-UTC → lokale `de-DE`-Anzeige                                                                                            |
| **FetchKeys**               | `app/utils/fetch-keys.ts`                         | Stabile `useFetch`-Cache-Keys pro API-Endpoint                                                                                 |
| **RefreshFetchData**        | `app/utils/refresh-fetch-data.ts`                 | Globales UI-Refresh nach Mutationen (`refreshNuxtData`); z. B. `refreshAgentsData()`                                           |
| **DatabaseLifecycle**       | `server/database/lifecycle.ts`                    | Relocate, Reset, Pfad-Info                                                                                                     |
| **Repository**              | `server/services/*/repository.ts`                 | SQL + Row-Mapping pro Domäne                                                                                                   |
| **PlatformLabels**          | `shared/platform-labels.ts`                       | UI-Labels für eBay / Kleinanzeigen / Beide (Recherche); Inventar-Optionen inkl. Sonstige (`INVENTORY_PLATFORM_SELECT_OPTIONS`) |
| **InventoryPlatform**       | `shared/detect-platform.ts`                       | `normalizeInventoryPlatform()` — eBay, Kleinanzeigen, Sonstige (nur Inventar; URL-Erkennung unverändert)                       |
| **FlippingCalculator**      | `shared/flipping-calculator.ts`                   | Margen-/Score-Hilfsfunktion (Legacy; nicht mehr im Flipping-UI-Flow)                                                           |

## Schichten-Konvention

- **Routes** — HTTP-Adapter (Validierung, Statuscodes, Domain-Error-Mapping)
- **Use-Case-Module** — Geschäftslogik (`RunAgent`, `ResearchRun`, `analyzeFlip`, `generateListing`, `ScraperRuntime`)
- **Repository-Module** — SQL + Row-Mapping pro Domäne
- **Shared** — Plattformübergreifende Pure Functions (`shared/`)
- **Composables** — Frontend-State aligned mit Server-APIs (`useResearch`, `useSavedResearches`, `useFlipping`, `useSavedFlipAnalyses`, `useDashboard`, `useAgents`, …); Mutationen invalidieren verknüpfte Fetch-Keys (Speichern → sofortige UI-Aktualisierung)
