import { getDb } from "../../database/db";
import { getInventorySummary } from "../../services/inventory/index";

export default defineEventHandler(() => {
  const db = getDb();
  return getInventorySummary(db);
});
