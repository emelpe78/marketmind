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
  "watchlist-scrape-interval-hours": "6",
  "ai-provider": "openrouter",
  "openrouter-api-key": "",
  "default-model": "deepseek/deepseek-v4-pro",
  "local-ai-api-url": "http://127.0.0.1:11434/v1",
  "local-ai-api-key": "",
  "local-ai-model": "",
  "database-path": "",
};

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
