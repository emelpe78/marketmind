import { getDb } from "../../database/db";
import { exportDatabaseAsSql } from "../../database/sql-transfer";

export default defineEventHandler((event) => {
  const db = getDb();
  const sql = exportDatabaseAsSql(db);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `marketmind-backup-${date}.sql`;

  setHeader(event, "Content-Type", "application/sql; charset=utf-8");
  setHeader(event, "Content-Disposition", `attachment; filename="${filename}"`);

  return sql;
});
