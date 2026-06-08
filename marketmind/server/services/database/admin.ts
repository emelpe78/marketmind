import { copyFileSync, existsSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";
import { getDb, getDbPath, initDatabase, resetDb } from "../../database/db";
import {
  readConfiguredPathFromFile,
  resolveDbPath,
} from "../../database/paths";
import { seedDatabase, setSetting } from "../../database/seed";

const SQLITE_SIDEcars = ["-wal", "-shm"] as const;

export function getDatabaseInfo(): { path: string; exists: boolean } {
  const path = getDbPath();
  return { path, exists: existsSync(path) };
}

function copySqliteFiles(from: string, to: string): void {
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  for (const suffix of SQLITE_SIDEcars) {
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
  for (const suffix of SQLITE_SIDEcars) {
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
  const currentPath = getDbPath();
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
  const path = getDbPath();
  resetDb();
  deleteSqliteFiles(path);

  const db = initDatabase(path);
  seedDatabase(db);
  setSetting(db, "database-path", path);

  return { path };
}

export { readConfiguredPathFromFile, resolveDbPath };
