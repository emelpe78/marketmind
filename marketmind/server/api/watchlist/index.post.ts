import { getDb } from "../../database/db";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const body = await readBody(event);
  const result = db
    .prepare(
      "INSERT INTO watchlist (title, url, platform, target_price, status) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      body.title,
      body.url ?? null,
      body.platform ?? null,
      body.target_price ?? null,
      body.status ?? "aktiv",
    );
  return db
    .prepare("SELECT * FROM watchlist WHERE id = ?")
    .get(result.lastInsertRowid);
});
