import type Database from "better-sqlite3";

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }
  if (Buffer.isBuffer(value)) {
    return `X'${value.toString("hex")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

type SqliteMasterRow = {
  type: string;
  name: string;
  sql: string | null;
};

export function exportDatabaseAsSql(db: Database.Database): string {
  const lines: string[] = [
    "-- MarketMind SQLite Backup",
    `-- Erstellt: ${new Date().toISOString()}`,
    "PRAGMA foreign_keys=OFF;",
    "BEGIN TRANSACTION;",
  ];

  const objects = db
    .prepare(
      `SELECT type, name, sql
       FROM sqlite_master
       WHERE sql IS NOT NULL
         AND name NOT LIKE 'sqlite_%'
       ORDER BY CASE type
         WHEN 'table' THEN 1
         WHEN 'index' THEN 2
         WHEN 'trigger' THEN 3
         ELSE 4
       END, name`,
    )
    .all() as SqliteMasterRow[];

  const tables = objects.filter((row) => row.type === "table");

  for (const table of tables) {
    if (!table.sql) continue;
    lines.push(`${table.sql};`);
  }

  for (const table of tables) {
    const columns = (
      db.prepare(`PRAGMA table_info(${quoteIdent(table.name)})`).all() as {
        name: string;
      }[]
    ).map((column) => quoteIdent(column.name));
    if (columns.length === 0) continue;

    const rows = db
      .prepare(`SELECT * FROM ${quoteIdent(table.name)}`)
      .raw()
      .all() as unknown[][];
    const columnList = columns.join(", ");

    for (const row of rows) {
      const values = row.map((value) => sqlLiteral(value)).join(", ");
      lines.push(
        `INSERT INTO ${quoteIdent(table.name)} (${columnList}) VALUES (${values});`,
      );
    }
  }

  const sequences = db
    .prepare("SELECT name, seq FROM sqlite_sequence")
    .all() as { name: string; seq: number }[];
  if (sequences.length > 0) {
    lines.push("DELETE FROM sqlite_sequence;");
    for (const sequence of sequences) {
      lines.push(
        `INSERT INTO sqlite_sequence VALUES(${sqlLiteral(sequence.name)}, ${sqlLiteral(sequence.seq)});`,
      );
    }
  }

  for (const object of objects) {
    if (object.type === "index" && object.sql) {
      lines.push(`${object.sql};`);
    }
  }

  lines.push("COMMIT;");
  lines.push("PRAGMA foreign_keys=ON;");
  lines.push("");

  return lines.join("\n");
}

export function validateSqlBackup(content: string): void {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("SQL-Datei ist leer");
  }
  const normalized = trimmed.toUpperCase();
  if (
    !normalized.includes("CREATE TABLE") &&
    !normalized.includes("INSERT INTO")
  ) {
    throw new Error("Keine gültige MarketMind-SQL-Sicherung");
  }
}
