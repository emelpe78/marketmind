import { getDb } from "../../database/db";

export default defineEventHandler(() => {
  const db = getDb();
  return db
    .prepare("SELECT * FROM prompt_library ORDER BY created_at DESC")
    .all();
});
