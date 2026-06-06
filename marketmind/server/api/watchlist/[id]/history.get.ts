import { getDb } from "../../../database/db";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const db = getDb();
  return db
    .prepare(
      "SELECT * FROM watchlist_history WHERE watchlist_id = ? ORDER BY scraped_at ASC",
    )
    .all(Number(id));
});
