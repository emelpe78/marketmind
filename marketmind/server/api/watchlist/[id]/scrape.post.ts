import { defineApiHandler, parseRouteId } from "../../../utils/api-handler";
import { findWatchlistById } from "../../../services/watchlist/repository";
import { scrapeWatchlistItem } from "../../../services/watchlist/scraper";
import { emptyBodySchema } from "../../schemas/common";

export default defineApiHandler(emptyBodySchema, async (db, _body, event) => {
  const id = parseRouteId(event);
  const item = findWatchlistById(db, id);
  if (!item) {
    throw createError({ statusCode: 404, message: "Eintrag nicht gefunden" });
  }

  await scrapeWatchlistItem(db, item);
  return findWatchlistById(db, id);
});
