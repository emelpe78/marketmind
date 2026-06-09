import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { isAbsolute, join, resolve } from "node:path";

export function isDatabasePathLocked(): boolean {
  return Boolean(process.env.MM_DATABASE_PATH?.trim());
}

export function getRuntimeDefaultPath(): string {
  if (process.env.MM_DATABASE_PATH) {
    return process.env.MM_DATABASE_PATH;
  }
  try {
    const config = useRuntimeConfig();
    return config.databasePath || "data/marketmind.db";
  } catch {
    return "data/marketmind.db";
  }
}

export function resolveDbPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) {
    return resolve(process.cwd(), getRuntimeDefaultPath());
  }
  if (trimmed.startsWith("~/")) {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return resolve(home, trimmed.slice(2));
  }
  if (isAbsolute(trimmed)) {
    return trimmed;
  }
  return resolve(process.cwd(), trimmed);
}

export function getActivePath(liveDbPath?: string | null): string {
  if (process.env.MM_DATABASE_PATH) {
    return resolveDbPath(process.env.MM_DATABASE_PATH);
  }

  if (liveDbPath) {
    return resolveDbPath(liveDbPath);
  }

  const bootstrapPath = resolveDbPath(getRuntimeDefaultPath());
  const configured = readConfiguredPathFromFile(bootstrapPath);
  if (configured) {
    return resolveDbPath(configured);
  }

  return bootstrapPath;
}

export function readConfiguredPathFromFile(dbPath: string): string | null {
  if (!existsSync(dbPath)) return null;
  try {
    const db = new Database(dbPath, { readonly: true });
    const row = db
      .prepare("SELECT value FROM settings WHERE key = 'database-path'")
      .get() as { value: string } | undefined;
    db.close();
    return row?.value?.trim() || null;
  } catch {
    return null;
  }
}
