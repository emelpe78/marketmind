# renderMarkdownBlock()

> God node · 7 connections · [/Users/mlp/Projekte/marketmind/marketmind/app/utils/render-markdown.ts](file:///Users/mlp/Projekte/marketmind/marketmind/app/utils/render-markdown.ts#L110)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as renderMarkdownBlock()
    participant P1 as renderMarkdownDocument()
    participant P2 as renderSectionCards()
    participant P3 as renderAnalysisMarkdown()
    participant P4 as extractMarkdownTitle()
    participant P5 as isTableSeparatorRow()
    participant P6 as renderTable()
    participant P7 as formatInlineMarkdown()
    participant P8 as escapeHtml()
    participant P9 as renderBlockquote()
    participant P10 as parseTableRow()
    P0->>+ P1: calls
    P1-->>- P0: return
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P2: calls
    P2-->>- P1: return
    P2->>+ P0: calls
    P0-->>- P2: return
    P2->>+ P1: calls
    P1-->>- P2: return
    P1->>+ P3: calls
    P3-->>- P1: return
    P3->>+ P1: calls
    P1-->>- P3: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P4->>+ P1: calls
    P1-->>- P4: return
    P0->>+ P5: calls
    P5-->>- P0: return
    P5->>+ P0: calls
    P0-->>- P5: return
    P5->>+ P6: calls
    P6-->>- P5: return
    P6->>+ P5: calls
    P5-->>- P6: return
    P0->>+ P7: calls
    P7-->>- P0: return
    P7->>+ P0: calls
    P0-->>- P7: return
    P7->>+ P8: calls
    P8-->>- P7: return
    P0->>+ P2: calls
    P2-->>- P0: return
    P0->>+ P9: calls
    P9-->>- P0: return
    P0->>+ P10: calls
    P10-->>- P0: return
```

## Connections by Relation

### calls
- [[renderMarkdownDocument()]] `EXTRACTED`
- [[isTableSeparatorRow()]] `EXTRACTED`
- [[formatInlineMarkdown()]] `EXTRACTED`
- [[renderSectionCards()]] `EXTRACTED`
- [[renderBlockquote()]] `EXTRACTED`
- [[parseTableRow()]] `EXTRACTED`

### contains
- [[render-markdown.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*