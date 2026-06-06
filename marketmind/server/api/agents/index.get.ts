import { getDb } from "../../database/db";

export default defineEventHandler(() => {
  const db = getDb();
  return db.prepare("SELECT * FROM agents ORDER BY id").all();
});
