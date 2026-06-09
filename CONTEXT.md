# MarketMind — Domänensprache

Glossar für Architektur-Reviews und Code. Begriffe aus dem PRD plus technische Module.

## Produktbereiche

| Begriff                | Bedeutung                                                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Preisrecherche**     | Scraper + Statistik + optionale KI-Marktanalyse für eBay.de und Kleinanzeigen.de. Einstieg nur über `ResearchRun` + `saved-researches` (keine separaten Search-CRUD-Routen)  |
| **Flipping**           | Margen-Kalkulation und KI-Bewertung für privaten Weiterverkauf (ohne Plattformgebühren). `RunAgent` mit `mode: "optional"` — bei fehlender KI-Konfiguration keine Empfehlung |
| **Anzeigen-Generator** | KI-erzeugte Verkaufstexte, plattformspezifisch (eBay / Kleinanzeigen)                                                                                                        |
| **Watchlist**          | Beobachtete Artikel mit Preis-Scraping und Zielpreis-Alarm                                                                                                                   |
| **Inventar**           | Gekaufte/verkaufte Artikel mit Gewinn/Verlust; Server liefert berechnetes `profit`                                                                                           |
| **Agent-Manager**      | Konfigurierbare KI-Agents (System-Prompt, Modell, Temperatur); Persistenz in `agents/repository.ts`                                                                          |

## Technische Module

| Begriff                 | Datei                                          | Bedeutung                                                                             |
| ----------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| **SettingsStore**       | `server/database/settings.ts`                  | Laufzeit-Konfiguration aus SQLite, inkl. verschlüsselter Secrets                      |
| **ScraperRuntime**      | `server/services/scraper/runtime.ts`           | Einheitliche Scraping-Session: Throttle pro Instanz, Cache, User-Agent                |
| **RunAgent**            | `server/services/ai/run-agent.ts`              | KI-Use-Case: Config → Agent → Completion → History (`required` / `optional` / `skip`) |
| **ResearchRun**         | `server/services/research/run-research.ts`     | Preisrecherche: Scrape → Stats → optionale Analyse → optionales Speichern             |
| **generateListing**     | `server/services/listings/generate-listing.ts` | Anzeigen-Generator: Marktkontext → `RunAgent` → Parsing                               |
| **analyzeFlip**         | `server/services/flipping/analyze-flip.ts`     | Flipping: `calculateFlip` → optionale KI-Empfehlung                                   |
| **generateAgentPrompt** | `server/services/agents/generate-prompt.ts`    | Meta-Prompt-Generierung für Agent-Manager                                             |
| **DatabaseLifecycle**   | `server/database/lifecycle.ts`                 | Relocate, Reset, Pfad-Info                                                            |
| **Repository**          | `server/services/*/repository.ts`              | SQL + Row-Mapping pro Domäne                                                          |
| **PlatformLabels**      | `shared/platform-labels.ts`                    | Kanonische UI-Labels für eBay / Kleinanzeigen / Beide                                 |
| **FlippingCalculator**  | `shared/flipping-calculator.ts`                | Margen- und Score-Berechnung (Client + Server)                                        |

## Schichten-Konvention

- **Routes** — HTTP-Adapter (Validierung, Statuscodes, Domain-Error-Mapping)
- **Use-Case-Module** — Geschäftslogik (`RunAgent`, `ResearchRun`, `generateListing`, `ScraperRuntime`)
- **Repository-Module** — SQL + Row-Mapping pro Domäne
- **Shared** — Plattformübergreifende Pure Functions (`shared/`)
- **Composables** — Frontend-State aligned mit Server-APIs (`useResearch`, `useFlipping`, `useDashboard`, …)
