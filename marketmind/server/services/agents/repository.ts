import type Database from "better-sqlite3";

export interface AgentInput {
  name: string;
  type: string;
  model?: string | null;
  system_prompt: string;
  temperature?: number;
}

export function findAgentById(db: Database.Database, id: number) {
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
}

export function createAgent(db: Database.Database, body: AgentInput) {
  const result = db
    .prepare(
      "INSERT INTO agents (name, type, model, system_prompt, temperature) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      body.name,
      body.type,
      body.model ?? null,
      body.system_prompt,
      body.temperature ?? 0.7,
    );
  return findAgentById(db, Number(result.lastInsertRowid));
}

export function updateAgent(
  db: Database.Database,
  id: number,
  body: AgentInput,
) {
  db.prepare(
    "UPDATE agents SET name=?, type=?, model=?, system_prompt=?, temperature=? WHERE id=?",
  ).run(
    body.name,
    body.type,
    body.model ?? null,
    body.system_prompt,
    body.temperature ?? 0.7,
    id,
  );
  return findAgentById(db, id);
}

export function deleteAgent(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM agents WHERE id = ?").run(id);
  return result.changes > 0;
}
