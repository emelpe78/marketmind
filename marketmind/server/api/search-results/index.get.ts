import { getDb } from "../../database/db";
import { findSearchResults } from "../../services/searches/repository";

export default defineEventHandler((event) => {
  const searchId = getQuery(event).search_id;
  return findSearchResults(getDb(), searchId ? Number(searchId) : null);
});
