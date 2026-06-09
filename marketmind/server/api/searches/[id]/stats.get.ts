import { getDb } from "../../../database/db";
import {
  findSearchById,
  getSearchStats,
} from "../../../services/searches/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }
  const db = getDb();
  const search = findSearchById(db, Number(id));
  if (!search) {
    throw createError({ statusCode: 404, message: "Suche nicht gefunden" });
  }
  return getSearchStats(db, Number(id));
});
