import { getDb } from "../../database/db";
import { deleteSavedResearch } from "../../services/research/saved-research";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }

  const db = getDb();
  const deleted = deleteSavedResearch(db, id);
  if (!deleted) {
    throw createError({
      statusCode: 404,
      message: "Gespeicherte Recherche nicht gefunden",
    });
  }

  return { success: true };
});
