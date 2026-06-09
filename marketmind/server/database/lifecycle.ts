import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { getActivePath, resolveDbPath } from "./paths";
import { getDb, initDatabase, resetDb } from "./db";
import { seedDatabase } from "./seed";
import { setSetting } from "./settings";

const SQLITE_SIDECARS = ["-wal", "-shm"] as const;

/**
 * Invariants:
 * - MM_DATABASE_PATH env overrides everything when set
 * - relocate/reset call resetDb() before switching files; WAL/SHM sidecars copied on relocate
 */

export function getDatabaseInfo(): { path: string; exists: boolean } {
  const path = getActivePath();
  return { path, exists: existsSync(path) };
}

function copySqliteFiles(from: string, to: string): void {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  for (const suffix of SQLITE_SIDECARS) {
    const sidecar = `${from}${suffix}`;
    if (existsSync(sidecar)) {
      copyFileSync(sidecar, `${to}${suffix}`);
    }
  }
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

export function relocateDatabase(newPathInput: string): {
  path: string;
  copied: boolean;
} {
  const currentPath = getActivePath();
  const targetPath = resolveDbPath(newPathInput);

  if (targetPath === currentPath) {
    const db = getDb(targetPath);
    setSetting(db, "database-path", targetPath);
    return { path: targetPath, copied: false };
  }

  resetDb();

  let copied = false;
  if (existsSync(currentPath)) {
    copySqliteFiles(currentPath, targetPath);
    copied = true;
  } else {
    mkdirSync(dirname(targetPath), { recursive: true });
  }

  const db = initDatabase(targetPath);
  seedDatabase(db);
  setSetting(db, "database-path", targetPath);

  return { path: targetPath, copied };
}

export function resetDatabase(): { path: string } {
  const path = getActivePath();
  resetDb();
  deleteSqliteFiles(path);

  const db = initDatabase(path);
  seedDatabase(db);
  setSetting(db, "database-path", path);

  return { path };
}
