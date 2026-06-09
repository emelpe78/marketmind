import { getDb } from "../../database/db";
import { deleteWatchlistItem } from "../../services/watchlist/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deleteWatchlistItem(getDb(), Number(id));
  return { success: true };
});
