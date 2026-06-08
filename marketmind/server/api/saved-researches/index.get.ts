import { getDb } from "../../database/db";
import { listSavedResearches } from "../../services/research/saved-research";

export default defineEventHandler(() => {
  const db = getDb();
  return listSavedResearches(db);
});
