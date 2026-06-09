import { getDb } from "../../database/db";
import {
  createSavedFlipAnalysis,
  type CreateSavedFlipAnalysisInput,
} from "../../services/flipping/saved-flip-analysis";

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateSavedFlipAnalysisInput>(event);

  if (!body?.listingUrl?.trim()) {
    throw createError({ statusCode: 400, message: "Anzeigen-URL fehlt" });
  }
  if (!body.listingPlatform) {
    throw createError({ statusCode: 400, message: "Plattform fehlt" });
  }
  if (!body.query?.trim()) {
    throw createError({ statusCode: 400, message: "Suchbegriff fehlt" });
  }
  if (!body.analysis?.trim()) {
    throw createError({ statusCode: 400, message: "Analyse fehlt" });
  }
  if (!body.listing || !body.marketStats) {
    throw createError({ statusCode: 400, message: "Analysedaten fehlen" });
  }

  const db = getDb();
  return createSavedFlipAnalysis(db, body);
});
