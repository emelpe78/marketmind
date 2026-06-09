import { getDb } from "../../database/db";
import { deleteSavedFlipAnalysis } from "../../services/flipping/saved-flip-analysis";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }

  const db = getDb();
  const deleted = deleteSavedFlipAnalysis(db, id);
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: "Gespeicherte Analyse nicht gefunden",
    });
  }

  return { success: true };
});
