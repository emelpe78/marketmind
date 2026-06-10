import { getDb } from "../../database/db";
import { listSavedFlipAnalysisItems } from "../../services/flipping/saved-flip-analysis";

export default defineEventHandler(() => {
  const db = getDb();
  return listSavedFlipAnalysisItems(db);
});
