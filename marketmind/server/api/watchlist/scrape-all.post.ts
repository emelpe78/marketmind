import { getDb } from "../../database/db";
import { findActiveWatchlistItems } from "../../services/watchlist/repository";
import { scrapeWatchlistItem } from "../../services/watchlist/scraper";

export default defineEventHandler(async () => {
  const db = getDb();
  const items = findActiveWatchlistItems(db);
  const results = [];
  for (const item of items) {
    const result = await scrapeWatchlistItem(db, item);
    results.push({ id: item.id, ...result });
  }
  return { updated: results.length, results };
});
