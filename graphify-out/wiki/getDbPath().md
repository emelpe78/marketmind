# getDbPath()

> God node · 8 connections · [/Users/mlp/Projekte/marketmind/marketmind/server/database/db.ts](file:///Users/mlp/Projekte/marketmind/marketmind/server/database/db.ts#L29)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as getDbPath()
    participant P1 as relocateDatabase()
    participant P2 as initDatabase()
    participant P3 as resetDatabase()
    participant P4 as getDb()
    participant P5 as setupDb()
    participant P6 as createTestDb()
    participant P7 as expectAllTables()
    participant P8 as resolveSchemaPath()
    participant P9 as resetDb()
    participant P10 as cleanupTestDb()
    participant P11 as seedDatabase()
    participant P12 as resolveDbPath()
    participant P13 as setSetting()
    participant P14 as copySqliteFiles()
    participant P15 as getRuntimeDefaultPath()
    participant P16 as readConfiguredPathFromFile()
    participant P17 as getDatabaseInfo()
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
    P2->>+ P7: calls
    P7-->>- P2: return
    P2->>+ P8: calls
    P8-->>- P2: return
    P1->>+ P9: calls
    P9-->>- P1: return
    P9->>+ P1: calls
    P1-->>- P9: return
    P9->>+ P3: calls
    P3-->>- P9: return
    P9->>+ P5: calls
    P5-->>- P9: return
    P9->>+ P6: calls
    P6-->>- P9: return
    P9->>+ P10: calls
    P10-->>- P9: return
    P1->>+ P4: calls
    P4-->>- P1: return
    P1->>+ P11: calls
    P11-->>- P1: return
    P1->>+ P12: calls
    P12-->>- P1: return
    P1->>+ P13: calls
    P13-->>- P1: return
    P1->>+ P14: calls
    P14-->>- P1: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P0->>+ P4: calls
    P4-->>- P0: return
    P0->>+ P12: calls
    P12-->>- P0: return
    P0->>+ P15: calls
    P15-->>- P0: return
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
- [[resolveDbPath()]] `INFERRED`
- [[getRuntimeDefaultPath()]] `INFERRED`
- [[readConfiguredPathFromFile()]] `INFERRED`
- [[getDatabaseInfo()]] `INFERRED`

### contains
- [[db.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*