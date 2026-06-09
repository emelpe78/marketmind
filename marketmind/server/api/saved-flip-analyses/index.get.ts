import { getDb } from "../../database/db";
import { listSavedFlipAnalyses } from "../../services/flipping/saved-flip-analysis";

export default defineEventHandler(() => {
  const db = getDb();
  return listSavedFlipAnalyses(db);
});
