import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const db = getDb();
  const searchId = getQuery(event).search_id;
  if (searchId) {
    return db
      .prepare(
        "SELECT * FROM search_results WHERE search_id = ? ORDER BY price ASC",
      )
      .all(Number(searchId));
  }
  return db
    .prepare("SELECT * FROM search_results ORDER BY timestamp DESC")
    .all();
});
