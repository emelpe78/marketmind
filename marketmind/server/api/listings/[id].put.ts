import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const db = getDb();
  db.prepare(
    "UPDATE listings SET query=?, platform=?, title=?, description=?, keywords=?, price_suggestion=? WHERE id=?",
  ).run(
    body.query,
    body.platform,
    body.title,
    body.description,
    body.keywords ?? null,
    body.price_suggestion ?? null,
    Number(id),
  );
  return db.prepare("SELECT * FROM listings WHERE id = ?").get(Number(id));
});
