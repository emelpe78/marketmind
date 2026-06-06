import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const result = db
    .prepare(
      "INSERT INTO listings (query, platform, title, description, keywords, price_suggestion) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .run(
      body.query,
      body.platform,
      body.title,
      body.description,
      body.keywords ?? null,
      body.price_suggestion ?? null,
    );
  return db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(result.lastInsertRowid);
});
