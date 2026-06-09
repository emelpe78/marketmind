import { getDb } from "../../database/db";
import { deleteSearchResult } from "../../services/searches/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deleteSearchResult(getDb(), Number(id));
  return { success: true };
});
