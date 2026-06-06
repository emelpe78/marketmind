# PRD: MarketMind
### Produkt Requirements Document v1.0

---

## Produkt-Übersicht

| Feld | Inhalt |
|---|---|
| **Produktname** | MarketMind |
| **Version** | 1.0 MVP |
| **Typ** | Lokales Desktop-Tool (Nuxt 4, läuft auf localhost) |
| **Sprache** | Deutsch |
| **Zielgruppe** | Eigengebrauch (Reseller, Flipper, Privatverkäufer) |
| **Lizenz** | Später Open Source |

---

## Ziele

1. Marktpreise für beliebige Produkte auf eBay.de & Kleinanzeigen.de automatisch ermitteln
2. KI-gestützte Analyse von Flipping-Potenzial und Margen (privater Verkauf, keine Plattformgebühren)
3. Plattform-optimierte Anzeigentexte generieren (separat für eBay & Kleinanzeigen)
4. Artikel beobachten und Inventar verwalten
5. Spezialisierte KI-Agents mit konfigurierbaren System-Prompts und Modell-Auswahl via OpenRouter

---

## Tech-Stack

| Schicht | Technologie |
|---|---|
| Framework | Nuxt 4 |
| Frontend | Vue.js 3 |
| UI-Bibliothek | Nuxt UI |
| Icons | Nuxt Icons |
| Datenbank | SQLite (direkt, kein ORM) |
| KI-Anbindung | OpenRouter API |
| Scraping | Cheerio + node-fetch (Nitro Server Routes) |
| Theme | Light (default) / Dark / System |
| Konfiguration | .env für API-Keys & Default-Modell |

---

## Seiten & Navigation

| Route | Seite | Beschreibung |
|---|---|---|
| `/` | Dashboard | Übersicht, letzte Suchen, Schnellzugriff, KPIs |
| `/research` | Preisrecherche | Scraper + KI-Marktanalyse |
| `/listings` | Anzeigen-Generator | Texte für eBay & Kleinanzeigen (separate Tabs) |
| `/flipping` | Flipping-Kalkulator | Margen, Flipping-Score (privater Verkauf) |
| `/watchlist` | Watchlist | Artikel beobachten, visueller Preisalarm |
| `/inventory` | Inventar | Gekaufte/verkaufte Artikel, Gewinn/Verlust |
| `/agents` | Agent-Manager | Agents verwalten, System-Prompt-Generator |
| `/settings` | Einstellungen | API-Keys, Modelle, Scraper-Config |

---

## Scraper-Engine

### eBay.de

- **Scope**: Nur abgeschlossene Auktionen + Sofortkauf-Verkäufe aus Deutschland
- **Beispiel-URL**: `https://www.ebay.de/sch/i.html?_nkw=rtx+3060+12gb&_sacat=0&_from=R40&LH_PrefLoc=1&LH_Sold=1&rt=nc&LH_Complete=1`
- **Pflicht-Parameter**: `LH_PrefLoc=1` (DE-only), `LH_Sold=1`, `LH_Complete=1`
- **Felder**: Titel, Endpreis, Zustand, Auktionstyp, Enddatum, URL
- **Pagination**: Automatisch alle Seiten durchlaufen
- **Historische Tiefe**: Konfigurierbar (Standard: letztes eBay-Limit ~90 Tage)

### Kleinanzeigen.de

- **Scope**: Aktive Anzeigen (keine abgeschlossenen verfügbar)
- **Felder**: Titel, Preis, Standort, Datum, Kategorie, URL
- **Hinweis**: Preise = Angebotspreise, keine Verkaufspreise → KI kennzeichnet dies in der Analyse

### Scraper-Konfiguration (in `/settings`)

| Option | Standard |
|---|---|
| Delay zwischen Requests | 2–5 Sek. (zufällig) |
| User-Agent Rotation | Aktiviert (5 vordefinierte) |
| Cache TTL | 6 Stunden |
| Max. Ergebnisse pro Suche | 100 |
| Proxy | Deaktiviert (optional konfigurierbar) |

---

## Preisrecherche (`/research`)

### Ablauf

1. Suchbegriff eingeben
2. Plattform wählen: eBay / Kleinanzeigen / Beide
3. Scraper läuft → Rohdaten in SQLite gespeichert
4. Research Agent analysiert via OpenRouter
5. Ergebnis-Dashboard mit Statistiken

### Ausgabe / Statistiken

- **Preisübersicht**: Min / Max / Durchschnitt / Median
- **Preisverteilung**: Histogramm (Artikel pro Preisklasse)
- **Zustandsanalyse**: Neu / Gebraucht / Defekt – Preisunterschiede
- **Plattformvergleich**: eBay-Verkaufspreise vs. Kleinanzeigen-Angebotspreise
- **Nachfrageindikator**: Anzahl verkaufter Artikel (eBay) als Proxy für Nachfrage
- **KI-Zusammenfassung**: Freitext-Analyse durch Research Agent

### Ergebnistabelle

- Sortierbar nach: Preis, Datum, Zustand, Plattform
- Filterbar nach: Plattform, Zustand, Preisrange, Datum
- Vollständige CRUD-Logik: Einträge anlegen, lesen, bearbeiten, löschen

---

## Anzeigen-Generator (`/listings`)

### Eingabe

- Suchbegriff / Produktname
- Zustand (Neu / Gebraucht / Defekt)
- Optionale Zusatzinfos (Zubehör, Besonderheiten, Mängel)
- Wunsch-Verkaufspreis (optional)

### Tab 1: Kleinanzeigen

- **Titel** (max. 70 Zeichen, locker & direkt)
- **Beschreibung** (informell, persönlich, mit Zustandsbeschreibung)
- **Preis-Empfehlung** (basierend auf Research-Daten falls vorhanden)
- **Kategorie-Vorschlag**

### Tab 2: eBay

- **Titel** (max. 80 Zeichen, keyword-optimiert)
- **Beschreibung** (strukturiert, mit Bullet Points, professionell)
- **Item Specifics Vorschläge** (Marke, Modell, Zustand etc.)
- **Startpreis- & Sofortkauf-Empfehlung**
- **Kategorie-Vorschlag**

### Verhalten

- Listing Agent verwendet plattformspezifischen System-Prompt
- Generierte Texte sind inline editierbar
- Speicherbar in SQLite (CRUD)
- Copy-to-Clipboard Button für jeden Abschnitt

---

## Flipping-Kalkulator (`/flipping`)

### Hinweis: Ausschließlich privater Verkauf – keine Plattformgebühren

### Eingabefelder

| Feld | Beschreibung |
|---|---|
| Einkaufspreis | Bezahlter Preis |
| Plattform Einkauf | eBay / Kleinanzeigen / Sonstiges |
| Plattform Verkauf | eBay / Kleinanzeigen |
| Versandkosten | Manuell eingeben |
| Verpackungskosten | Manuell eingeben |
| Verkaufspreis | Geplanter oder tatsächlicher Preis |

### Berechnungslogik

```
Verkaufspreis (VP)
  − Versandkosten
  − Verpackungskosten
  ─────────────────────────────────────────
  = Netto-Erlös

Rohgewinn  = Netto-Erlös − Einkaufspreis
Marge      = Rohgewinn / Einkaufspreis × 100

Flipping-Score:
  > 30%  → Sehr lohnenswert
  15–30% → Solide
  5–15%  → Grenzwertig
  < 5%   → Nicht empfehlenswert
```

### KI-Integration

- Analytics Agent bewertet: Nachfrage, Verkaufsdauer, Markttrend
- Empfehlung: Kaufen / Abwarten / Finger weg

---

## Watchlist (`/watchlist`)

### Funktionen

- Artikel manuell hinzufügen (Titel, URL, Zielpreis, Plattform)
- Automatisches Re-Scraping in konfigurierbarem Intervall (z.B. alle 6h)
- **Manuelles Re-Scraping**: Button pro Artikel und globaler "Alle aktualisieren"-Button
- **Visueller Alert im Tool**: Badge/Banner wenn Zielpreis erreicht oder unterschritten
- Preishistorie pro Artikel (Chart)
- Status: Aktiv / Pausiert / Erledigt
- Vollständige CRUD-Logik für alle Watchlist-Einträge

---

## Inventar (`/inventory`)

### Felder pro Artikel

| Feld | Beschreibung |
|---|---|
| Titel | Produktname |
| Einkaufspreis | Bezahlter Preis |
| Einkaufsplattform | eBay / Kleinanzeigen / Sonstiges |
| Einkaufsdatum | Datum |
| Verkaufspreis | Erzielter Preis |
| Verkaufsplattform | eBay / Kleinanzeigen |
| Verkaufsdatum | Datum |
| Status | Gekauft / Zum Verkauf / Verkauft |
| Gewinn/Verlust | Automatisch berechnet |
| Notizen | Freitext |

### Übersicht & CRUD

- Gesamtgewinn / Gesamtverlust
- Durchschnittliche Marge
- Beste/schlechteste Flips
- Filterbar nach Status, Plattform, Zeitraum
- Vollständige CRUD-Logik: Anlegen, Lesen, Bearbeiten, Löschen

---

## Agent-Manager (`/agents`)

### Vordefinierte Agents

| Agent | Aufgabe | Standard-Modell |
|---|---|---|
| Research Agent | Marktpreise, Nachfrage, Konkurrenz analysieren | Default-Modell (.env) |
| Listing Agent | Anzeigentexte für eBay & Kleinanzeigen | Default-Modell (.env) |
| Analytics Agent | Flipping-Potenzial, Margen, Trends bewerten | Default-Modell (.env) |
| Strategy Agent | Kauf-/Verkaufszeitpunkt, Risikoeinschätzung | Default-Modell (.env) |

### Modell-Auswahl

- Modelle werden **live via OpenRouter API** geladen (`GET /api/v1/models`)
- Dropdown pro Agent mit allen verfügbaren Modellen
- Wenn kein Modell gewählt → Fallback auf `DEFAULT_MODEL` aus `.env`
- `.env` Variablen: `OPENROUTER_API_KEY`, `DEFAULT_MODEL`

### Agent-Konfiguration (pro Agent)

- Name & Beschreibung (editierbar)
- System-Prompt (editierbar, mit Syntax-Highlighting)
- Modell-Auswahl (Dropdown via OpenRouter API)
- Temperatur (Slider 0.0–1.0)
- Verlaufsansicht (letzte N Anfragen mit Token-Verbrauch & Kosten)
- Vollständige CRUD-Logik: Agents anlegen, bearbeiten, löschen

### System-Prompt-Generator

1. Nutzer beschreibt Ziel in natürlicher Sprache
2. Meta-Agent (Default-Modell) generiert strukturierten System-Prompt
3. Vorschau + Inline-Bearbeitung
4. Speichern → Agent zuweisen oder in Bibliothek ablegen

### Prompt-Bibliothek

- Alle gespeicherten Prompts mit Name, Kategorie, Datum
- Prompts können Agents zugewiesen werden
- Import / Export als `.txt` oder `.json`
- Vollständige CRUD-Logik

---

## Datenbankschema (SQLite) – vollständige CRUD-Logik

Alle Tabellen unterstützen vollständige CRUD-Operationen über Nuxt Server Routes (Nitro API).

```sql
-- Suchanfragen
CREATE TABLE searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  platform TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  results_count INTEGER
);

-- Suchergebnisse (Rohdaten Scraper)
CREATE TABLE search_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  search_id INTEGER REFERENCES searches(id) ON DELETE CASCADE,
  title TEXT,
  price REAL,
  url TEXT,
  platform TEXT,
  condition TEXT,
  sold INTEGER,
  location TEXT,
  end_date DATETIME,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generierte Anzeigen
CREATE TABLE listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT,
  platform TEXT,
  title TEXT,
  description TEXT,
  keywords TEXT,
  price_suggestion REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agents
CREATE TABLE agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT,
  model TEXT,
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prompt-Bibliothek
CREATE TABLE prompt_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agent-Verlauf
CREATE TABLE agent_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  user_input TEXT,
  response TEXT,
  tokens_used INTEGER,
  cost_usd REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist
CREATE TABLE watchlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  url TEXT,
  platform TEXT,
  target_price REAL,
  current_price REAL,
  alert_active INTEGER DEFAULT 1,
  status TEXT DEFAULT 'aktiv',
  last_scraped DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist Preishistorie
CREATE TABLE watchlist_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  watchlist_id INTEGER REFERENCES watchlist(id) ON DELETE CASCADE,
  price REAL,
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventar
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  buy_price REAL,
  buy_platform TEXT,
  buy_date DATE,
  sell_price REAL,
  sell_platform TEXT,
  sell_date DATE,
  status TEXT DEFAULT 'gekauft',
  profit REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Einstellungen
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

### CRUD-Endpunkte (Nitro Server Routes)

Jede Tabelle erhält folgende API-Routen:

| Methode | Route | Aktion |
|---|---|---|
| GET | `/api/[ressource]` | Alle Einträge lesen |
| GET | `/api/[ressource]/[id]` | Einzelnen Eintrag lesen |
| POST | `/api/[ressource]` | Neuen Eintrag anlegen |
| PUT | `/api/[ressource]/[id]` | Eintrag bearbeiten |
| DELETE | `/api/[ressource]/[id]` | Eintrag löschen |

---

## Einstellungen (`/settings`)

| Kategorie | Einstellung |
|---|---|
| **API** | OpenRouter API-Key |
| **Modelle** | Default-Modell (Fallback für alle Agents) |
| **Scraper** | Delay, User-Agent, Cache TTL, Max. Ergebnisse |
| **Proxy** | Host, Port, Auth (optional) |
| **Watchlist** | Automatisches Re-Scraping-Intervall |
| **Theme** | Light / Dark / System |

### .env Konfiguration

```
OPENROUTER_API_KEY=sk-or-...
DEFAULT_MODEL=google/gemini-2.5-pro
```

---

## Bau-Reihenfolge (empfohlen)

| Phase | Features | Priorität |
|---|---|---|
| Phase 1 | Settings, .env, DB-Init, OpenRouter-Anbindung, Theme | Fundament |
| Phase 2 | Scraper Engine (eBay + Kleinanzeigen), Research-Seite + CRUD | Kern |
| Phase 3 | Agent-Manager, System-Prompt-Generator, Prompt-Bibliothek | KI-Layer |
| Phase 4 | Anzeigen-Generator (Tab Kleinanzeigen + Tab eBay) | Mehrwert |
| Phase 5 | Flipping-Kalkulator (privat, ohne Gebühren) | Analyse |
| Phase 6 | Watchlist mit visuellem Alert + manuellem Re-Scraping | Komfort |
| Phase 7 | Inventar-Verwaltung | Verwaltung |
| Phase 8 | Dashboard (alles zusammenführen, KPIs) | Abschluss |
