# scrapeKleinanzeigen()

> God node · 9 connections · [/Users/mlp/Projekte/marketmind/marketmind/server/services/scraper/index.ts](file:///Users/mlp/Projekte/marketmind/marketmind/server/services/scraper/index.ts#L98)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as scrapeKleinanzeigen()
    participant P1 as fetchWithConfig()
    participant P2 as scrapeEbay()
    participant P3 as getAllSettings()
    participant P4 as scraperDeps()
    participant P5 as runSearch()
    participant P6 as getFetcherConfig()
    participant P7 as buildEbaySearchUrl()
    participant P8 as invalidateCachedHtml()
    participant P9 as parseEbayHtml()
    participant P10 as warmUpOrigin()
    participant P11 as buildRequestHeaders()
    participant P12 as mergeCookies()
    participant P13 as blockedMessage()
    participant P14 as warmUpUrl()
    participant P15 as text
    participant P16 as scrapeWatchlistItem()
    participant P17 as createFetcherSession()
    participant P18 as detectPlatform()
    participant P19 as getCachedHtml()
    participant P20 as getNextUserAgent()
    participant P21 as originKey()
    participant P22 as cookieHeaderForOrigin()
    participant P23 as setCachedHtml()
    participant P24 as buildKleinanzeigenSearchUrl()
    participant P25 as parseKleinanzeigenHtml()
    P0->>+ P1: calls
    P1-->>- P0: return
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
    P2->>+ P7: calls
    P7-->>- P2: return
    P2->>+ P8: calls
    P8-->>- P2: return
    P2->>+ P9: calls
    P9-->>- P2: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P10: calls
    P10-->>- P1: return
    P10->>+ P1: calls
    P1-->>- P10: return
    P10->>+ P11: calls
    P11-->>- P10: return
    P10->>+ P12: calls
    P12-->>- P10: return
    P10->>+ P13: calls
    P13-->>- P10: return
    P10->>+ P14: calls
    P14-->>- P10: return
    P1->>+ P15: calls
    P15-->>- P1: return
    P1->>+ P11: calls
    P11-->>- P1: return
    P1->>+ P12: calls
    P12-->>- P1: return
    P1->>+ P16: calls
    P16-->>- P1: return
    P1->>+ P17: calls
    P17-->>- P1: return
    P1->>+ P18: calls
    P18-->>- P1: return
    P1->>+ P19: calls
    P19-->>- P1: return
    P1->>+ P13: calls
    P13-->>- P1: return
    P1->>+ P20: calls
    P20-->>- P1: return
    P1->>+ P21: calls
    P21-->>- P1: return
    P1->>+ P22: calls
    P22-->>- P1: return
    P1->>+ P23: calls
    P23-->>- P1: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P0->>+ P4: calls
    P4-->>- P0: return
    P0->>+ P5: calls
    P5-->>- P0: return
    P0->>+ P6: calls
    P6-->>- P0: return
    P0->>+ P8: calls
    P8-->>- P0: return
    P0->>+ P24: calls
    P24-->>- P0: return
    P0->>+ P25: calls
    P25-->>- P0: return
```

## Connections by Relation

### calls
- [[fetchWithConfig()]] `INFERRED`
- [[getAllSettings()]] `INFERRED`
- [[scraperDeps()]] `EXTRACTED`
- [[runSearch()]] `EXTRACTED`
- [[getFetcherConfig()]] `EXTRACTED`
- [[invalidateCachedHtml()]] `INFERRED`
- [[buildKleinanzeigenSearchUrl()]] `INFERRED`
- [[parseKleinanzeigenHtml()]] `INFERRED`

### contains
- [[index.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*