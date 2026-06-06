import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
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
  return db
    .prepare("SELECT * FROM agents WHERE id = ?")
    .get(result.lastInsertRowid);
});
