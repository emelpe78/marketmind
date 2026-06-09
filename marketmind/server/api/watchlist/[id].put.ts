import { getDb } from "../../database/db";
import { updateWatchlistItem } from "../../services/watchlist/repository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return updateWatchlistItem(getDb(), Number(id), body);
});
