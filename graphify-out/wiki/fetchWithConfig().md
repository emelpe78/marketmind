# fetchWithConfig()

> God node · 16 connections · [/Users/mlp/Projekte/marketmind/marketmind/server/services/scraper/fetcher.ts](file:///Users/mlp/Projekte/marketmind/marketmind/server/services/scraper/fetcher.ts#L248)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as fetchWithConfig()
    participant P1 as scrapeEbay()
    participant P2 as getAllSettings()
    participant P3 as scrapeKleinanzeigen()
    participant P4 as runSearch()
    participant P5 as scrapeWatchlistItem()
    participant P6 as getAiConfig()
    participant P7 as scraperDeps()
    participant P8 as createFetcherSession()
    participant P9 as getFetcherConfig()
    participant P10 as buildEbaySearchUrl()
    participant P11 as invalidateCachedHtml()
    participant P12 as parseEbayHtml()
    participant P13 as warmUpOrigin()
    participant P14 as text
    participant P15 as buildRequestHeaders()
    participant P16 as mergeCookies()
    participant P17 as detectPlatform()
    participant P18 as getCachedHtml()
    participant P19 as blockedMessage()
    participant P20 as getNextUserAgent()
    participant P21 as originKey()
    participant P22 as cookieHeaderForOrigin()
    participant P23 as setCachedHtml()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P2: calls
    P2-->>- P1: return
    P2->>+ P1: calls
    P1-->>- P2: return
    P2->>+ P3: calls
    P3-->>- P2: return
    P2->>+ P4: calls
    P4-->>- P2: return
    P2->>+ P5: calls
    P5-->>- P2: return
    P2->>+ P6: calls
    P6-->>- P2: return
    P1->>+ P7: calls
    P7-->>- P1: return
    P7->>+ P1: calls
    P1-->>- P7: return
    P7->>+ P3: calls
    P3-->>- P7: return
    P7->>+ P8: calls
    P8-->>- P7: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P4->>+ P1: calls
    P1-->>- P4: return
    P4->>+ P3: calls
    P3-->>- P4: return
    P4->>+ P2: calls
    P2-->>- P4: return
    P1->>+ P9: calls
    P9-->>- P1: return
    P1->>+ P10: calls
    P10-->>- P1: return
    P1->>+ P11: calls
    P11-->>- P1: return
    P1->>+ P12: calls
    P12-->>- P1: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P0->>+ P13: calls
    P13-->>- P0: return
    P0->>+ P14: calls
    P14-->>- P0: return
    P0->>+ P15: calls
    P15-->>- P0: return
    P0->>+ P16: calls
    P16-->>- P0: return
    P0->>+ P5: calls
    P5-->>- P0: return
    P0->>+ P8: calls
    P8-->>- P0: return
    P0->>+ P17: calls
    P17-->>- P0: return
    P0->>+ P18: calls
    P18-->>- P0: return
    P0->>+ P19: calls
    P19-->>- P0: return
    P0->>+ P20: calls
    P20-->>- P0: return
    P0->>+ P21: calls
    P21-->>- P0: return
    P0->>+ P22: calls
    P22-->>- P0: return
    P0->>+ P23: calls
    P23-->>- P0: return
```

## Connections by Relation

### calls
- [[scrapeEbay()]] `INFERRED`
- [[scrapeKleinanzeigen()]] `INFERRED`
- [[warmUpOrigin()]] `EXTRACTED`
- [[text]] `INFERRED`
- [[buildRequestHeaders()]] `EXTRACTED`
- [[mergeCookies()]] `EXTRACTED`
- [[scrapeWatchlistItem()]] `INFERRED`
- [[createFetcherSession()]] `EXTRACTED`
- [[detectPlatform()]] `EXTRACTED`
- [[getCachedHtml()]] `EXTRACTED`
- [[blockedMessage()]] `EXTRACTED`
- [[getNextUserAgent()]] `EXTRACTED`
- [[originKey()]] `EXTRACTED`
- [[cookieHeaderForOrigin()]] `EXTRACTED`
- [[setCachedHtml()]] `EXTRACTED`

### contains
- [[fetcher.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*