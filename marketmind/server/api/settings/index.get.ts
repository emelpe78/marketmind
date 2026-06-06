import { getDb } from "../../database/db";
import { getAllSettings } from "../../database/seed";

export default defineEventHandler(() => {
  const db = getDb();
  return getAllSettings(db);
});
