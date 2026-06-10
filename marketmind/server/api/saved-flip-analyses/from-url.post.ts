import { defineApiHandler } from "../../utils/api-handler";
import { saveFlipAnalysisFromUrl } from "../../services/flipping/saved-flip-analysis";
import { savedFlipFromUrlBodySchema } from "../schemas/flipping";

export default defineApiHandler(
  savedFlipFromUrlBodySchema,
  async (db, body) => {
    return saveFlipAnalysisFromUrl(db, body);
  },
);
