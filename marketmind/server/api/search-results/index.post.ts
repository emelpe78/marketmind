import { getDb } from "../../database/db";
import { createSearchResult } from "../../services/searches/repository";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return createSearchResult(getDb(), body);
});
