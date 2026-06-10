import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { getActivePath } from "./paths";
import { getDb, initDatabase, resetDb } from "./db";
import { seedDatabase } from "./seed";
import { setSetting } from "./settings";

const SQLITE_SIDECARS = ["-wal", "-shm"] as const;

export function getDatabaseInfo(): { path: string; exists: boolean } {
  const path = getActivePath();
  return { path, exists: existsSync(path) };
}

function deleteSqliteFiles(dbPath: string): void {
  if (existsSync(dbPath)) {
    unlinkSync(dbPath);
  }
  for (const suffix of SQLITE_SIDECARS) {
    const sidecar = `${dbPath}${suffix}`;
    if (existsSync(sidecar)) {
      unlinkSync(sidecar);
    }
  }
}

export function resetDatabase(): { path: string } {
  const path = getActivePath();
  resetDb();
  deleteSqliteFiles(path);
  mkdirSync(dirname(path), { recursive: true });

  const db = initDatabase(path);
  seedDatabase(db);
  setSetting(db, "database-path", path);

  return { path };
}
