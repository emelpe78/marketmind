import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const db = getDb();
  db.prepare(
    "UPDATE prompt_library SET name=?, prompt=?, category=? WHERE id=?",
  ).run(body.name, body.prompt, body.category ?? null, Number(id));
  return db
    .prepare("SELECT * FROM prompt_library WHERE id = ?")
    .get(Number(id));
});
