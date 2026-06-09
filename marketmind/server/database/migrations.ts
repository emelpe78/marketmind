import type Database from "better-sqlite3";

function hasColumn(db: Database.Database, table: string, column: string) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string;
  }>;
  return columns.some((entry) => entry.name === column);
}

export function runMigrations(db: Database.Database): void {
  if (!hasColumn(db, "prompt_library", "agent_id")) {
    db.exec(
      "ALTER TABLE prompt_library ADD COLUMN agent_id INTEGER REFERENCES agents(id) ON DELETE SET NULL",
    );
  }

  if (hasColumn(db, "prompt_library", "category")) {
    db.exec("ALTER TABLE prompt_library DROP COLUMN category");
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_prompt_library_agent_id
    ON prompt_library(agent_id)
    WHERE agent_id IS NOT NULL
  `);

  renameDefaultAgents(db);
}

const AGENT_RENAMES: Array<[type: string, name: string]> = [
  ["analytics", "Flipping Agent"],
  ["strategy", "Prompt Agent"],
];

function renameDefaultAgents(db: Database.Database): void {
  for (const [type, name] of AGENT_RENAMES) {
    db.prepare("UPDATE agents SET name = ? WHERE type = ?").run(name, type);
    db.prepare(
      `UPDATE prompt_library
       SET name = ?
       WHERE agent_id IN (SELECT id FROM agents WHERE type = ?)`,
    ).run(name, type);
  }
}
