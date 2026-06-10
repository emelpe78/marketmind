import type Database from "better-sqlite3";
import { applyPromptToAgent, clearAgentAssignmentExcept } from "./assign";

export interface PromptLibraryInput {
  name: string;
  prompt: string;
  agent_id?: number | null;
}

export interface PromptLibraryRow {
  id: number;
  name: string;
  prompt: string;
  agent_id: number | null;
  created_at: string;
}

export function findAllPrompts(db: Database.Database) {
  return db
    .prepare("SELECT * FROM prompt_library ORDER BY created_at DESC")
    .all() as PromptLibraryRow[];
}

export function findPromptById(
  db: Database.Database,
  id: number,
): PromptLibraryRow | undefined {
  return db.prepare("SELECT * FROM prompt_library WHERE id = ?").get(id) as
    | PromptLibraryRow
    | undefined;
}

export function findPromptByAgentId(db: Database.Database, agentId: number) {
  return db
    .prepare("SELECT * FROM prompt_library WHERE agent_id = ?")
    .get(agentId) as PromptLibraryRow | undefined;
}

function persistAgentAssignment(
  db: Database.Database,
  promptId: number,
  agentId: number | null,
  promptText: string,
): void {
  if (agentId != null) {
    clearAgentAssignmentExcept(db, agentId, promptId);
    applyPromptToAgent(db, agentId, promptText);
  }
}

export function createPrompt(db: Database.Database, body: PromptLibraryInput) {
  const agentId = body.agent_id ?? null;

  if (agentId != null) {
    db.prepare("DELETE FROM prompt_library WHERE agent_id = ?").run(agentId);
  }

  const result = db
    .prepare(
      "INSERT INTO prompt_library (name, prompt, agent_id) VALUES (?, ?, ?)",
    )
    .run(body.name, body.prompt, agentId);

  const promptId = Number(result.lastInsertRowid);
  if (agentId != null) {
    applyPromptToAgent(db, agentId, body.prompt);
  }

  return findPromptById(db, promptId);
}

export function updatePrompt(
  db: Database.Database,
  id: number,
  body: PromptLibraryInput,
) {
  const previous = findPromptById(db, id);
  const agentId = body.agent_id ?? null;

  if (agentId != null) {
    persistAgentAssignment(db, id, agentId, body.prompt);
  } else if (previous?.agent_id != null) {
    applyPromptToAgent(db, previous.agent_id, body.prompt);
  }

  db.prepare(
    "UPDATE prompt_library SET name=?, prompt=?, agent_id=? WHERE id=?",
  ).run(body.name, body.prompt, agentId, id);

  return findPromptById(db, id);
}

export function countPrompts(db: Database.Database): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM prompt_library")
    .get() as { count: number };
  return row.count;
}

export function deletePrompt(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM prompt_library WHERE id = ?").run(id);
  return result.changes > 0;
}
