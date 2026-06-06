import { getDb, getTableNames } from "../database/db";

export function getHealthStatus() {
  const db = getDb();
  const tables = getTableNames(db);
  return {
    status: "ok" as const,
    db: true,
    tables: tables.length,
  };
}
