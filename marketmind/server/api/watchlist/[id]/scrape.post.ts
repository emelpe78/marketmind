import { getDb } from "../../../database/db";
import { findWatchlistById } from "../../../services/watchlist/repository";
import { scrapeWatchlistItem } from "../../../services/watchlist/scraper";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const db = getDb();
  const item = findWatchlistById(db, Number(id));
  if (!item) {
    throw createError({ statusCode: 404, message: "Eintrag nicht gefunden" });
  }

  await scrapeWatchlistItem(db, item);
  return findWatchlistById(db, Number(id));
});
