# initDatabase()

> God node · 8 connections · [/Users/mlp/Projekte/marketmind/marketmind/server/database/db.ts](file:///Users/mlp/Projekte/marketmind/marketmind/server/database/db.ts#L92)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as initDatabase()
    participant P1 as relocateDatabase()
    participant P2 as getDbPath()
    participant P3 as resetDatabase()
    participant P4 as getDb()
    participant P5 as resolveDbPath()
    participant P6 as getRuntimeDefaultPath()
    participant P7 as readConfiguredPathFromFile()
    participant P8 as getDatabaseInfo()
    participant P9 as resetDb()
    participant P10 as setupDb()
    participant P11 as createTestDb()
    participant P12 as cleanupTestDb()
    participant P13 as seedDatabase()
    participant P14 as setSetting()
    participant P15 as copySqliteFiles()
    participant P16 as expectAllTables()
    participant P17 as resolveSchemaPath()
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
    P1->>+ P0: calls
    P0-->>- P1: return
    P1->>+ P9: calls
    P9-->>- P1: return
    P9->>+ P1: calls
    P1-->>- P9: return
    P9->>+ P3: calls
    P3-->>- P9: return
    P9->>+ P10: calls
    P10-->>- P9: return
    P9->>+ P11: calls
    P11-->>- P9: return
    P9->>+ P12: calls
    P12-->>- P9: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P1->>+ P13: calls
    P13-->>- P1: return
    P1->>+ P5: calls
    P5-->>- P1: return
    P1->>+ P14: calls
    P14-->>- P1: return
    P1->>+ P15: calls
    P15-->>- P1: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P0->>+ P4: calls
    P4-->>- P0: return
    P0->>+ P10: calls
    P10-->>- P0: return
    P0->>+ P11: calls
    P11-->>- P0: return
    P0->>+ P16: calls
    P16-->>- P0: return
    P0->>+ P17: calls
    P17-->>- P0: return
```

## Connections by Relation

### calls
- [[relocateDatabase()]] `INFERRED`
- [[resetDatabase()]] `INFERRED`
- [[getDb()]] `EXTRACTED`
- [[setupDb()]] `INFERRED`
- [[createTestDb()]] `INFERRED`
- [[expectAllTables()]] `INFERRED`
- [[resolveSchemaPath()]] `EXTRACTED`

### contains
- [[db.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*