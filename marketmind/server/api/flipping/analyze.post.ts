import { defineApiHandler } from "../../utils/api-handler";
import { analyzeFlip } from "../../services/flipping/analyze-flip";
import { flippingAnalyzeBodySchema } from "../schemas/flipping";

export default defineApiHandler(flippingAnalyzeBodySchema, async (db, body) => {
  return analyzeFlip(db, { url: body.url });
});
