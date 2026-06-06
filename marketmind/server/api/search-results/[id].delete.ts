import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const db = getDb();
  db.prepare("DELETE FROM search_results WHERE id = ?").run(Number(id));
  return { success: true };
});
