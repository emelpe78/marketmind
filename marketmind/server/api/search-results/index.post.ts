import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const result = db
    .prepare(
      `INSERT INTO search_results (search_id, title, price, url, platform, condition, sold, location, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.search_id,
      body.title,
      body.price,
      body.url,
      body.platform,
      body.condition ?? null,
      body.sold ?? 0,
      body.location ?? null,
      body.end_date ?? null,
    );
  return db
    .prepare("SELECT * FROM search_results WHERE id = ?")
    .get(result.lastInsertRowid);
});
