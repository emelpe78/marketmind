import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  const db = getDb();
  db.prepare(
    `UPDATE search_results SET title=?, price=?, url=?, platform=?, condition=?, sold=?, location=?, end_date=?
     WHERE id=?`,
  ).run(
    body.title,
    body.price,
    body.url,
    body.platform,
    body.condition ?? null,
    body.sold ?? 0,
    body.location ?? null,
    body.end_date ?? null,
    Number(id),
  );
  return db
    .prepare("SELECT * FROM search_results WHERE id = ?")
    .get(Number(id));
});
