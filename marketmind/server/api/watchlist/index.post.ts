import { defineApiHandler } from "../../utils/api-handler";
import { createWatchlistItem } from "../../services/watchlist/repository";
import { watchlistCreateBodySchema } from "../schemas/watchlist";

export default defineApiHandler(watchlistCreateBodySchema, async (db, body) => {
  return createWatchlistItem(db, body);
});
