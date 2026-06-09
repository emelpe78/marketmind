# relocateDatabase()

> God node · 9 connections · [/Users/mlp/Projekte/marketmind/marketmind/server/services/database/admin.ts](file:///Users/mlp/Projekte/marketmind/marketmind/server/services/database/admin.ts#L40)

## Call Trace Diagram

```mermaid
sequenceDiagram
    participant P0 as relocateDatabase()
    participant P1 as getDbPath()
    participant P2 as resetDatabase()
    participant P3 as initDatabase()
    participant P4 as resetDb()
    participant P5 as seedDatabase()
    participant P6 as setSetting()
    participant P7 as deleteSqliteFiles()
    participant P8 as getDb()
    participant P9 as getHealthStatus()
    participant P10 as resolveDbPath()
    participant P11 as getRuntimeDefaultPath()
    participant P12 as readConfiguredPathFromFile()
    participant P13 as getDatabaseInfo()
    participant P14 as copySqliteFiles()
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
    P1->>+ P8: calls
    P8-->>- P1: return
    P8->>+ P0: calls
    P0-->>- P8: return
    P8->>+ P1: calls
    P1-->>- P8: return
    P8->>+ P3: calls
    P3-->>- P8: return
    P8->>+ P9: calls
    P9-->>- P8: return
    P1->>+ P10: calls
    P10-->>- P1: return
    P1->>+ P11: calls
    P11-->>- P1: return
    P1->>+ P12: calls
    P12-->>- P1: return
    P1->>+ P13: calls
    P13-->>- P1: return
    P0->>+ P3: calls
    P3-->>- P0: return
    P0->>+ P4: calls
    P4-->>- P0: return
    P0->>+ P8: calls
    P8-->>- P0: return
    P0->>+ P5: calls
    P5-->>- P0: return
    P0->>+ P10: calls
    P10-->>- P0: return
    P0->>+ P6: calls
    P6-->>- P0: return
    P0->>+ P14: calls
    P14-->>- P0: return
```

## Connections by Relation

### calls
- [[getDbPath()]] `INFERRED`
- [[initDatabase()]] `INFERRED`
- [[resetDb()]] `INFERRED`
- [[getDb()]] `INFERRED`
- [[seedDatabase()]] `INFERRED`
- [[resolveDbPath()]] `INFERRED`
- [[setSetting()]] `INFERRED`
- [[copySqliteFiles()]] `EXTRACTED`

### contains
- [[admin.ts]] `EXTRACTED`

---

*Part of the graphify knowledge wiki. See [[index]] to navigate.*