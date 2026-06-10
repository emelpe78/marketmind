import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import { updateWatchlistItem } from "../../services/watchlist/repository";
import { watchlistUpdateBodySchema } from "../schemas/watchlist";

export default defineApiHandler(
  watchlistUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    return updateWatchlistItem(db, id, body);
  },
);
