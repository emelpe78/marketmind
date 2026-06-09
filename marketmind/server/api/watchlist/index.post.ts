import { getDb } from "../../database/db";
import { createWatchlistItem } from "../../services/watchlist/repository";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return createWatchlistItem(getDb(), body);
});
