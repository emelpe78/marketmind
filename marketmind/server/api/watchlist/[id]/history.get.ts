import { getDb } from "../../../database/db";
import { findWatchlistHistory } from "../../../services/watchlist/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  return findWatchlistHistory(getDb(), Number(id));
});
