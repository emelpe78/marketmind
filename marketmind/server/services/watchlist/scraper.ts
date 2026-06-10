import type Database from "better-sqlite3";
import { scrapeListingPrice } from "../scraper/price-extract";
import { createScraperRuntime } from "../scraper/runtime";
import { checkAlert } from "./alerts";
import type { WatchlistItem } from "./repository";

export { scrapeListingPrice } from "../scraper/price-extract";

export async function scrapeWatchlistItem(
  db: Database.Database,
  item: WatchlistItem,
  fetchFn: typeof fetch = fetch,
): Promise<{ price: number | null; alertTriggered: boolean }> {
  if (!item.url) return { price: null, alertTriggered: false };

  const runtime = createScraperRuntime(db, { fetchFn });
  const html = await runtime.fetchPage(item.url);
  const price = scrapeListingPrice(html);

  if (price !== null) {
    db.prepare(
      "UPDATE watchlist SET current_price = ?, last_scraped = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(price, item.id);
    db.prepare(
      "INSERT INTO watchlist_history (watchlist_id, price) VALUES (?, ?)",
    ).run(item.id, price);
  }

  const alertTriggered = checkAlert(
    price,
    item.target_price,
    item.alert_active,
  );

  return { price, alertTriggered };
}
