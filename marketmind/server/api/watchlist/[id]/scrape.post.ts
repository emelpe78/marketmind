import { getDb } from "../../../database/db";
import { scrapeWatchlistItem } from "../../../services/watchlist/scraper";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const db = getDb();
  const item = db
    .prepare("SELECT * FROM watchlist WHERE id = ?")
    .get(Number(id));
  if (!item) {
    throw createError({ statusCode: 404, message: "Eintrag nicht gefunden" });
  }
  const result = await scrapeWatchlistItem(db, item as never);
  return {
    ...item,
    current_price: result.price,
    alertTriggered: result.alertTriggered,
  };
});
