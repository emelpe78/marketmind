import { getDb } from "../../database/db";
import { scrapeWatchlistItem } from "../../services/watchlist/scraper";

export default defineEventHandler(async () => {
  const db = getDb();
  const items = db
    .prepare("SELECT * FROM watchlist WHERE status = 'aktiv'")
    .all() as never[];
  const results = [];
  for (const item of items) {
    const result = await scrapeWatchlistItem(db, item);
    results.push({ id: (item as { id: number }).id, ...result });
  }
  return { updated: results.length, results };
});
