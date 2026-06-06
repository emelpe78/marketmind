import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const db = getDb();
  db.prepare(
    "UPDATE agents SET name=?, type=?, model=?, system_prompt=?, temperature=? WHERE id=?",
  ).run(
    body.name,
    body.type,
    body.model ?? null,
    body.system_prompt,
    body.temperature ?? 0.7,
    Number(id),
  );
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(Number(id));
});
