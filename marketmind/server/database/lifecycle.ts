import { existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { getActivePath } from "./paths";
import { getDb, initDatabase, resetDb } from "./db";
import { runMigrations } from "./migrations";
import { seedDatabase } from "./seed";
import { setSetting } from "./settings";
import { exportDatabaseAsSql, validateSqlBackup } from "./sql-transfer";

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

export function backupDatabaseAsSql(): string {
  return exportDatabaseAsSql(getDb());
}

export function restoreDatabaseFromSql(sql: string): { path: string } {
  validateSqlBackup(sql);

  const path = getActivePath();
  resetDb();
  deleteSqliteFiles(path);
  mkdirSync(dirname(path), { recursive: true });

  const db = getDb(path);
  try {
    db.exec("PRAGMA foreign_keys=OFF;");
    db.exec(sql);
    db.exec("PRAGMA foreign_keys=ON;");
    runMigrations(db);
    setSetting(db, "database-path", path);
    return { path };
  } catch (error) {
    resetDb();
    deleteSqliteFiles(path);
    const freshDb = initDatabase(path);
    seedDatabase(freshDb);
    setSetting(freshDb, "database-path", path);

    const message =
      error instanceof Error ? error.message : "SQL-Import fehlgeschlagen";
    throw new Error(message);
  }
}
