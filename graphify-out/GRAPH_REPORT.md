# Graph Report - marketmind  (2026-06-09)

## Corpus Check
- 167 files · ~29,658 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1220 nodes · 1804 edges · 152 communities (123 shown, 29 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 41 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b002727`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 83|Community 83]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 85|Community 85]]
- [[_COMMUNITY_Community 86|Community 86]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 98|Community 98]]
- [[_COMMUNITY_Community 100|Community 100]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 103|Community 103]]
- [[_COMMUNITY_Community 104|Community 104]]
- [[_COMMUNITY_Community 105|Community 105]]
- [[_COMMUNITY_Community 107|Community 107]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 110|Community 110]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 112|Community 112]]
- [[_COMMUNITY_Community 113|Community 113]]
- [[_COMMUNITY_Community 115|Community 115]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 117|Community 117]]
- [[_COMMUNITY_Community 118|Community 118]]
- [[_COMMUNITY_Community 120|Community 120]]
- [[_COMMUNITY_Community 121|Community 121]]
- [[_COMMUNITY_Community 122|Community 122]]
- [[_COMMUNITY_Community 124|Community 124]]
- [[_COMMUNITY_Community 125|Community 125]]
- [[_COMMUNITY_Community 126|Community 126]]
- [[_COMMUNITY_Community 127|Community 127]]
- [[_COMMUNITY_Community 130|Community 130]]
- [[_COMMUNITY_Community 131|Community 131]]
- [[_COMMUNITY_Community 132|Community 132]]
- [[_COMMUNITY_Community 133|Community 133]]
- [[_COMMUNITY_Community 156|Community 156]]
- [[_COMMUNITY_Community 157|Community 157]]
- [[_COMMUNITY_Community 158|Community 158]]
- [[_COMMUNITY_Community 159|Community 159]]
- [[_COMMUNITY_Community 160|Community 160]]

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 70 edges
2. `runAgent()` - 21 edges
3. `setSetting()` - 20 edges
4. `createTestDb()` - 17 edges
5. `PRD: MarketMind` - 16 edges
6. `fetchWithConfig()` - 15 edges
7. `scripts` - 14 edges
8. `initDatabase()` - 14 edges
9. `fetchWithConfig()` - 14 edges
10. `Hinzugefügt` - 13 edges

## Surprising Connections (you probably didn't know these)
- `fetchWithConfig()` --calls--> `sleepFn`  [INFERRED]
  marketmind/server/services/scraper/fetcher.ts → marketmind/test/services/scraper-runtime.test.ts
- `generateListing()` --calls--> `formatEuro()`  [INFERRED]
  marketmind/server/services/listings/generate-listing.ts → marketmind/shared/format-currency.ts
- `parsePriceValue()` --calls--> `parseGermanPrice()`  [INFERRED]
  marketmind/server/services/listings/parse-generation.ts → marketmind/shared/parse-german-price.ts
- `scrapeListingPrice()` --calls--> `parseGermanPrice()`  [INFERRED]
  marketmind/server/services/watchlist/scraper.ts → marketmind/shared/parse-german-price.ts
- `setupDb()` --calls--> `setSetting()`  [INFERRED]
  marketmind/test/api/database.test.ts → marketmind/server/database/seed.ts

## Communities (152 total, 29 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (33): copiedDb, db, dbPath, freshDb, info, result, row, rows (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (37): getAiConfig(), normalizeAiBaseUrl(), isPromoTitle(), normalizeCondition(), parseEbayPrice(), parseListingFromElement(), db, format (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.14
Nodes (7): agentModalOpen, editingAgent, generatedPrompt, loading, promptDescription, temperatureMarks, toast

### Community 3 - "Community 3"
Cohesion: 0.60
Nodes (3): calculateProfit(), getInventorySummary(), toNumber()

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (43): Ablauf, Agent-Konfiguration (pro Agent), Agent-Manager (`/agents`), Anzeigen-Generator (`/listings`), Ausgabe / Statistiken, Bau-Reihenfolge (empfohlen), Berechnungslogik, code:block1 (Verkaufspreis (VP)) (+35 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (17): callCount, config, db, dbPath, fixturesDir, headers, html, idx (+9 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (7): agentId, db, items, params, query, rows, sql

### Community 7 - "Community 7"
Cohesion: 0.35
Nodes (5): body, db, profit, result, url

### Community 8 - "Community 8"
Cohesion: 0.36
Nodes (6): analyzeSearchByPlatform(), PLATFORM_LABEL, platformsForSearch(), authHeaders(), chatCompletion(), fetchModels()

### Community 9 - "Community 9"
Cohesion: 0.26
Nodes (12): escapeHtml(), extractAnalysisTitle, extractMarkdownTitle(), formatInlineMarkdown(), isTableSeparatorRow(), parseTableRow(), renderAnalysisMarkdown(), renderBlockquote() (+4 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (18): aiProviderTab, apiTabItems, { data: databaseInfo, refresh: refreshDatabase }, databasePathInput, err, relocatingDatabase, resetModalOpen, resettingDatabase (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (9): agent, ai, body, calculation, completion, db, model, recommendation (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.28
Nodes (7): body, db, existing, id, profit, updated, url

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (12): agent, agents, db, history, listing, listingStats, mockFetch, prompt (+4 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (12): agent, ai, body, completion, db, model, parsed, platformHint (+4 more)

### Community 15 - "Community 15"
Cohesion: 0.17
Nodes (11): agent, agents, db, history, listing, listingStats, mockFetch, research (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (7): formatDate(), formatPlatform(), platform, platformLabels, platformOptions, string, toast

### Community 17 - "Community 17"
Cohesion: 0.36
Nodes (3): db, deleted, id

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (8): aiConfig, db, inventorySummary, recentSearches, savedResearches, tokenRow, watchlistAlerts, watchlistItems

### Community 19 - "Community 19"
Cohesion: 0.39
Nodes (5): createSavedResearch(), getSavedResearch(), parseJson(), rowToSavedResearch(), updateSavedResearch()

### Community 22 - "Community 22"
Cohesion: 0.40
Nodes (4): agent, db, id, saved

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (18): db, db, dbPath, result, __dirname, getDb(), getDbPath(), getTableNames() (+10 more)

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (3): calc, score, scoreColor

### Community 25 - "Community 25"
Cohesion: 0.29
Nodes (5): db, id, insert, mockFetch, result

### Community 26 - "Community 26"
Cohesion: 0.40
Nodes (4): ai, body, db, prompt

### Community 27 - "Community 27"
Cohesion: 0.40
Nodes (4): db, items, result, results

### Community 28 - "Community 28"
Cohesion: 0.40
Nodes (4): db, id, item, result

### Community 29 - "Community 29"
Cohesion: 0.50
Nodes (3): display, html, sample

### Community 30 - "Community 30"
Cohesion: 0.50
Nodes (3): db, profit, summary

### Community 31 - "Community 31"
Cohesion: 0.50
Nodes (3): db, result, row

### Community 32 - "Community 32"
Cohesion: 0.50
Nodes (3): mockFetch, models, result

### Community 33 - "Community 33"
Cohesion: 0.50
Nodes (3): created, db, updated

### Community 34 - "Community 34"
Cohesion: 0.50
Nodes (3): db, dbPath, result

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (3): html, isDark, wasDark

### Community 36 - "Community 36"
Cohesion: 0.50
Nodes (3): body, db, key

### Community 37 - "Community 37"
Cohesion: 0.50
Nodes (3): ai, db, models

### Community 76 - "Community 76"
Cohesion: 0.15
Nodes (13): agents, db, config, db, db, result, row, resetDb() (+5 more)

### Community 77 - "Community 77"
Cohesion: 0.08
Nodes (24): code:bash (git clone https://github.com/emelpe78/marketmind.git), code:bash (git clone https://github.com/emelpe78/marketmind.git), code:bash (docker compose down), code:bash (cd marketmind/marketmind), code:bash (PORT=5666 node .output/server/index.mjs), code:block6 (marketmind/           # Repository-Root), code:bash (cd marketmind/marketmind), Datenbank (in der App) (+16 more)

### Community 78 - "Community 78"
Cohesion: 0.05
Nodes (57): buildEbaySearchUrl(), EbayListing, isPromoTitle(), normalizeCondition(), parseEbayHtml(), parseEbayPrice(), parseListingFromElement(), blockedMessage() (+49 more)

### Community 79 - "Community 79"
Cohesion: 0.08
Nodes (28): generateListing(), GenerateListingInput, body, db, domainError, ListingInput, parsed, results (+20 more)

### Community 80 - "Community 80"
Cohesion: 0.09
Nodes (22): API & Daten, Architektur, Backend (`marketmind/server/`), code:block1 (marketmind/                 # Repo-Root), code:bash (cd marketmind), Frontend (`marketmind/app/`), Git, Häufige Aufgaben (+14 more)

### Community 81 - "Community 81"
Cohesion: 0.12
Nodes (25): copiedDb, db, dbPath, freshDb, info, result, row, rows (+17 more)

### Community 82 - "Community 82"
Cohesion: 0.10
Nodes (16): AiConfig, AiProvider, getAiConfig(), normalizeAiBaseUrl(), ai, db, domainError, body (+8 more)

### Community 83 - "Community 83"
Cohesion: 0.05
Nodes (54): isAiConfigured(), db, insert, item, mockFetch, profit, summary, updated (+46 more)

### Community 84 - "Community 84"
Cohesion: 0.14
Nodes (12): db, settings, DEFAULT_AGENTS, DEFAULT_SETTINGS, getAllSettings(), getSetting(), db, mockChatCompletion (+4 more)

### Community 85 - "Community 85"
Cohesion: 0.26
Nodes (12): loadSearchResults(), loadStats(), mapSearchResults(), ResearchRunInput, ResearchRunResultRow, ResearchRunSummary, runResearch(), createSavedResearch() (+4 more)

### Community 86 - "Community 86"
Cohesion: 0.24
Nodes (4): analyzePrices(), median(), PriceHistogramBucket, SearchResultRow

### Community 88 - "Community 88"
Cohesion: 0.12
Nodes (19): generateAgentPrompt(), body, db, domainError, getAgentByType(), logAgentHistory(), resolveAgentModel(), assertAiConfigured() (+11 more)

### Community 89 - "Community 89"
Cohesion: 0.13
Nodes (18): created, db, updated, deleteSavedResearch(), getSavedResearch(), parseJson(), rowToSavedResearch(), SavedResearchAnalysis (+10 more)

### Community 90 - "Community 90"
Cohesion: 0.12
Nodes (25): [0.1.0] — 2026-06-09, [0.1.1] — 2026-06-09, [0.1.2] — 2026-06-09, Agent-Manager, Anzeigen-Generator, Behoben, Behoben, Changelog (+17 more)

### Community 91 - "Community 91"
Cohesion: 0.16
Nodes (20): applyMarkdownFormatting(), escapeHtml(), extractMarkdownTitle(), formatInlineMarkdown(), isTableSeparatorRow(), MarkdownDisplay, MarkdownSection, MarkdownSectionsDisplay (+12 more)

### Community 92 - "Community 92"
Cohesion: 0.21
Nodes (10): AnalysisPlatform, analyzeSearchByPlatform(), PLATFORM_LABEL, PlatformAnalysis, platformsForSearch(), db, history, mockChatCompletion (+2 more)

### Community 94 - "Community 94"
Cohesion: 0.39
Nodes (6): formatPlatformLabel(), PLATFORM_LABELS, PLATFORM_SELECT_OPTIONS, platformLabelFor(), RESEARCH_PLATFORM_LABELS, RESEARCH_PLATFORM_OPTIONS

### Community 95 - "Community 95"
Cohesion: 0.14
Nodes (14): scripts, build, dev, docker:build, docker:down, docker:up, generate, postinstall (+6 more)

### Community 96 - "Community 96"
Cohesion: 0.15
Nodes (11): author, bugs, url, description, homepage, keywords, license, name (+3 more)

### Community 97 - "Community 97"
Cohesion: 0.23
Nodes (8): id, id, createPrompt(), deletePrompt(), findAllPrompts(), findPromptById(), PromptLibraryInput, updatePrompt()

### Community 98 - "Community 98"
Cohesion: 0.20
Nodes (9): analyses, db, fixturesDir, mockFetch, page1, page2, saved, search (+1 more)

### Community 100 - "Community 100"
Cohesion: 0.17
Nodes (9): analyzeFlip(), calculateFlip(), FlipInput, FlippingScore, FlipResult, result, formatEuro(), formatEuroDelta() (+1 more)

### Community 102 - "Community 102"
Cohesion: 0.13
Nodes (12): db, history, mockChatCompletion, result, body, calculation, db, domainError (+4 more)

### Community 103 - "Community 103"
Cohesion: 0.11
Nodes (18): AiConnection, db, event, history, mockChatCompletion, result, db, history (+10 more)

### Community 104 - "Community 104"
Cohesion: 0.22
Nodes (9): dependencies, better-sqlite3, cheerio, @iconify-json/lucide, nuxt, @nuxt/ui, vue, vue-router (+1 more)

### Community 105 - "Community 105"
Cohesion: 0.16
Nodes (12): id, id, id, db, AgentInput, AgentRow, AgentWithStats, createAgent() (+4 more)

### Community 107 - "Community 107"
Cohesion: 0.29
Nodes (7): devDependencies, happy-dom, @nuxt/test-utils, @playwright/test, @types/better-sqlite3, vitest, @vue/test-utils

### Community 109 - "Community 109"
Cohesion: 0.33
Nodes (4): db, result, search, searchId

### Community 110 - "Community 110"
Cohesion: 0.40
Nodes (4): MarketMind — Domänensprache, Produktbereiche, Schichten-Konvention, Technische Module

### Community 111 - "Community 111"
Cohesion: 0.40
Nodes (3): PlatformSummary, ResearchRunResponse, SearchResult

### Community 112 - "Community 112"
Cohesion: 0.70
Nodes (4): extractDescription(), extractJsonObject(), parseListingGeneration(), parsePriceValue()

### Community 116 - "Community 116"
Cohesion: 0.50
Nodes (3): activeSection, activeTab, tabItems

### Community 117 - "Community 117"
Cohesion: 0.50
Nodes (4): repository, directory, type, url

### Community 118 - "Community 118"
Cohesion: 0.50
Nodes (3): db, id, saved

### Community 124 - "Community 124"
Cohesion: 0.67
Nodes (3): engines, node, npm

### Community 160 - "Community 160"
Cohesion: 0.29
Nodes (6): ResearchRunResult, CreateSavedResearchInput, SavedResearch, body, db, PriceStats

## Knowledge Gaps
- **560 isolated node(s):** `name`, `version`, `description`, `author`, `license` (+555 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **29 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `Community 23` to `Community 15`, `Community 25`, `Community 160`, `Community 76`, `Community 78`, `Community 79`, `Community 81`, `Community 82`, `Community 83`, `Community 84`, `Community 88`, `Community 89`, `Community 92`, `Community 97`, `Community 98`, `Community 102`, `Community 103`, `Community 105`, `Community 109`, `Community 118`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `analyzeFlip()` connect `Community 100` to `Community 88`, `Community 84`, `Community 102`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `runAgent()` connect `Community 88` to `Community 100`, `Community 102`, `Community 103`, `Community 79`, `Community 82`, `Community 83`, `Community 92`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _560 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06794871794871794 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05137844611528822 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._