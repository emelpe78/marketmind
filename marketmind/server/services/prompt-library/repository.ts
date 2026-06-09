import type Database from "better-sqlite3";

export interface PromptLibraryInput {
  name: string;
  prompt: string;
  category?: string | null;
}

export function findAllPrompts(db: Database.Database) {
  return db
    .prepare("SELECT * FROM prompt_library ORDER BY created_at DESC")
    .all();
}

export function findPromptById(db: Database.Database, id: number) {
  return db.prepare("SELECT * FROM prompt_library WHERE id = ?").get(id);
}

export function createPrompt(db: Database.Database, body: PromptLibraryInput) {
  const result = db
    .prepare(
      "INSERT INTO prompt_library (name, prompt, category) VALUES (?, ?, ?)",
    )
    .run(body.name, body.prompt, body.category ?? null);
  return findPromptById(db, Number(result.lastInsertRowid));
}

export function updatePrompt(
  db: Database.Database,
  id: number,
  body: PromptLibraryInput,
) {
  db.prepare(
    "UPDATE prompt_library SET name=?, prompt=?, category=? WHERE id=?",
  ).run(body.name, body.prompt, body.category ?? null, id);
  return findPromptById(db, id);
}

export function deletePrompt(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM prompt_library WHERE id = ?").run(id);
  return result.changes > 0;
}
