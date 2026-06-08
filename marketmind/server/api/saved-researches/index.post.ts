import { getDb } from "../../database/db";
import {
  createSavedResearch,
  type CreateSavedResearchInput,
} from "../../services/research/saved-research";

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateSavedResearchInput>(event);

  if (!body?.query?.trim()) {
    throw createError({ statusCode: 400, message: "Suchbegriff fehlt" });
  }
  if (!body.platform) {
    throw createError({ statusCode: 400, message: "Plattform fehlt" });
  }
  if (!body.stats || !Array.isArray(body.results)) {
    throw createError({
      statusCode: 400,
      message: "Suchergebnisse fehlen",
    });
  }

  const db = getDb();
  return createSavedResearch(db, body);
});
