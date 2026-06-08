-- Suchanfragen
CREATE TABLE IF NOT EXISTS searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  platform TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  results_count INTEGER
);

-- Suchergebnisse (Rohdaten Scraper)
CREATE TABLE IF NOT EXISTS search_results (
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

-- Gespeicherte Recherchen (Snapshot: Ergebnisse + KI-Analyse)
CREATE TABLE IF NOT EXISTS saved_researches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  query TEXT NOT NULL,
  platform TEXT NOT NULL,
  search_id INTEGER REFERENCES searches(id) ON DELETE SET NULL,
  stats_json TEXT NOT NULL,
  results_json TEXT NOT NULL,
  analyses_json TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generierte Anzeigen
CREATE TABLE IF NOT EXISTS listings (
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
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT,
  model TEXT,
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Prompt-Bibliothek
CREATE TABLE IF NOT EXISTS prompt_library (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Agent-Verlauf
CREATE TABLE IF NOT EXISTS agent_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER REFERENCES agents(id) ON DELETE CASCADE,
  user_input TEXT,
  response TEXT,
  tokens_used INTEGER,
  cost_usd REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist
CREATE TABLE IF NOT EXISTS watchlist (
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
CREATE TABLE IF NOT EXISTS watchlist_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  watchlist_id INTEGER REFERENCES watchlist(id) ON DELETE CASCADE,
  price REAL,
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inventar
CREATE TABLE IF NOT EXISTS inventory (
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
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Scraper Cache
CREATE TABLE IF NOT EXISTS scraper_cache (
  url TEXT PRIMARY KEY,
  html TEXT NOT NULL,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
