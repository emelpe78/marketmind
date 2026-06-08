import { getDb } from "../../database/db";
import { getSavedResearch } from "../../services/research/saved-research";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }

  const db = getDb();
  const saved = getSavedResearch(db, id);
  if (!saved) {
    throw createError({
      statusCode: 404,
      message: "Gespeicherte Recherche nicht gefunden",
    });
  }

  return saved;
});
