import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const result = db
    .prepare(
      "INSERT INTO prompt_library (name, prompt, category) VALUES (?, ?, ?)",
    )
    .run(body.name, body.prompt, body.category ?? null);
  return db
    .prepare("SELECT * FROM prompt_library WHERE id = ?")
    .get(result.lastInsertRowid);
});
