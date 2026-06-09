import { getDb } from "../../database/db";
import { getAllSettings } from "../../database/settings";

export default defineEventHandler(() => {
  const db = getDb();
  return getAllSettings(db);
});
