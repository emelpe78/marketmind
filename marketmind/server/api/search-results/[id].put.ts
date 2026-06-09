import { getDb } from "../../database/db";
import { updateSearchResult } from "../../services/searches/repository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return updateSearchResult(getDb(), Number(id), body);
});
