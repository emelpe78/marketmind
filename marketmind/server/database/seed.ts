import type Database from "better-sqlite3";
import {
  decodeSecret,
  encodeSecret,
  isSecretSettingKey,
} from "../services/settings/secrets";

export const DEFAULT_SETTINGS: Record<string, string> = {
  "scraper-delay-min": "2",
  "scraper-delay-max": "5",
  "scraper-user-agent-rotation": "true",
  "scraper-cache-ttl-hours": "6",
  "scraper-max-results": "100",
  "scraper-proxy-enabled": "false",
  "scraper-proxy-host": "",
  "scraper-proxy-port": "",
  "scraper-proxy-auth": "",
  "watchlist-scrape-interval-hours": "6",
  "ai-provider": "openrouter",
  "openrouter-api-key": "",
  "default-model": "deepseek/deepseek-v4-pro",
  "local-ai-api-url": "http://127.0.0.1:11434/v1",
  "local-ai-api-key": "",
  "local-ai-model": "",
  "database-path": "",
};

const DEFAULT_AGENTS = [
  {
    name: "Research Agent",
    type: "research",
    system_prompt:
      "Du bist ein Marktanalyse-Experte für eBay.de und Kleinanzeigen.de. Analysiere Verkaufspreise, Nachfrage und Konkurrenz. Antworte auf Deutsch, präzise und datenbasiert.",
  },
  {
    name: "Listing Agent",
    type: "listing",
    system_prompt:
      "Du erstellst optimierte Verkaufsanzeigen für eBay und Kleinanzeigen. Passe Ton und Struktur an die Plattform an. Antworte auf Deutsch.",
  },
  {
    name: "Analytics Agent",
    type: "analytics",
    system_prompt:
      "Du bewertest Flipping-Potenzial, Margen und Markttrends für privaten Verkauf ohne Plattformgebühren. Antworte auf Deutsch mit klarer Empfehlung.",
  },
  {
    name: "Strategy Agent",
    type: "strategy",
    system_prompt:
      "Du berätst zu optimalem Kauf- und Verkaufszeitpunkt sowie Risikoeinschätzung. Antworte auf Deutsch, strategisch und handlungsorientiert.",
  },
];

export function seedDatabase(db: Database.Database): void {
  const insertSetting = db.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, value);
  }

  const agentCount = db
    .prepare("SELECT COUNT(*) as count FROM agents")
    .get() as { count: number };
  if (agentCount.count === 0) {
    const insertAgent = db.prepare(
      "INSERT INTO agents (name, type, system_prompt, temperature) VALUES (?, ?, ?, 0.7)",
    );
    for (const agent of DEFAULT_AGENTS) {
      insertAgent.run(agent.name, agent.type, agent.system_prompt);
    }
  }
}

export function getAllSettings(db: Database.Database): Record<string, string> {
  const rows = db.prepare("SELECT key, value FROM settings").all() as {
    key: string;
    value: string;
  }[];
  const settings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = isSecretSettingKey(row.key)
      ? decodeSecret(row.value)
      : row.value;
  }
  return settings;
}

export function getSetting(
  db: Database.Database,
  key: string,
): string | undefined {
  const row = db
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  if (!row) return DEFAULT_SETTINGS[key];
  if (!row.value) return "";
  return isSecretSettingKey(key) ? decodeSecret(row.value) : row.value;
}

export function setSetting(
  db: Database.Database,
  key: string,
  value: string,
): void {
  const storedValue = isSecretSettingKey(key) ? encodeSecret(value) : value;
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, storedValue);
}
