import { getDb } from "../../database/db";
import { listSavedResearchItems } from "../../services/research/saved-research";

export default defineEventHandler(() => {
  const db = getDb();
  return listSavedResearchItems(db);
});
