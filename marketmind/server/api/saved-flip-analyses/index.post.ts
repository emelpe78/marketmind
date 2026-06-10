import { defineApiHandler } from "../../utils/api-handler";
import { createSavedFlipAnalysis } from "../../services/flipping/saved-flip-analysis";
import { savedFlipAnalysisBodySchema } from "../schemas/flipping";

export default defineApiHandler(
  savedFlipAnalysisBodySchema,
  async (db, body) => {
    return createSavedFlipAnalysis(db, body);
  },
);
