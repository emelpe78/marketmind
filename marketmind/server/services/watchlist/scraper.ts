import type Database from "better-sqlite3";
import { load } from "cheerio";
import { parseGermanPrice } from "shared/parse-german-price";
import { createScraperRuntime } from "../scraper/runtime";

export interface WatchlistRow {
  id: number;
  title: string;
  url: string | null;
  platform: string | null;
  target_price: number | null;
  current_price: number | null;
  alert_active: number;
  status: string;
}

export function scrapeListingPrice(html: string): number | null {
  const $ = load(html);
  const ebayPrice = $(".x-price-primary, .s-item__price, .ux-textspans--PRICE")
    .first()
    .text();
  if (ebayPrice) {
    const price = parseGermanPrice(ebayPrice);
    if (price !== null) return price;
  }
  const kaPrice = $(".boxedarticle--price, .aditem-main--middle--price")
    .first()
    .text();
  if (kaPrice) return parseGermanPrice(kaPrice);
  return null;
}

export async function scrapeWatchlistItem(
  db: Database.Database,
  item: WatchlistRow,
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

export function checkAlert(
  currentPrice: number | null,
  targetPrice: number | null,
  alertActive: number,
): boolean {
  return (
    currentPrice !== null &&
    targetPrice !== null &&
    currentPrice <= targetPrice &&
    alertActive === 1
  );
}
