import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const db = getDb();
  return db.prepare("SELECT * FROM searches ORDER BY timestamp DESC").all();
});
