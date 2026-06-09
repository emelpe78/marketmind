import { getDb } from "../../database/db";
import { updateSavedFlipAnalysis } from "../../services/flipping/saved-flip-analysis";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }

  const body = await readBody<{ title: string }>(event);
  if (!body?.title?.trim()) {
    throw createError({ statusCode: 400, message: "Titel fehlt" });
  }

  const db = getDb();
  const updated = updateSavedFlipAnalysis(db, id, { title: body.title });
  if (!updated) {
    throw createError({
      statusCode: 404,
      message: "Gespeicherte Analyse nicht gefunden",
    });
  }

  return updated;
});
