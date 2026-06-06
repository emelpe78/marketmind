import type Database from "better-sqlite3";
import { load } from "cheerio";
import { fetchWithConfig, type FetcherConfig } from "../scraper/fetcher";
import { getAllSettings } from "../../database/seed";

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
    const match = ebayPrice.match(/[\d.,]+/);
    if (match) return parseFloat(match[0].replace(".", "").replace(",", "."));
  }
  const kaPrice = $(".boxedarticle--price, .aditem-main--middle--price")
    .first()
    .text();
  if (kaPrice) {
    const match = kaPrice.match(/[\d.,]+/);
    if (match) return parseFloat(match[0].replace(".", "").replace(",", "."));
  }
  return null;
}

export async function scrapeWatchlistItem(
  db: Database.Database,
  item: WatchlistRow,
  fetchFn: typeof fetch = fetch,
): Promise<{ price: number | null; alertTriggered: boolean }> {
  if (!item.url) return { price: null, alertTriggered: false };

  const settings = getAllSettings(db);
  const config: FetcherConfig = {
    delayMinMs: Number(settings["scraper-delay-min"]) * 1000,
    delayMaxMs: Number(settings["scraper-delay-max"]) * 1000,
    userAgentRotation: settings["scraper-user-agent-rotation"] === "true",
    cacheTtlHours: Number(settings["scraper-cache-ttl-hours"]),
  };

  const html = await fetchWithConfig(db, item.url, config, { fetchFn });
  const price = scrapeListingPrice(html);

  if (price !== null) {
    db.prepare(
      "UPDATE watchlist SET current_price = ?, last_scraped = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(price, item.id);
    db.prepare(
      "INSERT INTO watchlist_history (watchlist_id, price) VALUES (?, ?)",
    ).run(item.id, price);
  }

  const alertTriggered =
    price !== null &&
    item.target_price !== null &&
    price <= item.target_price &&
    item.alert_active === 1;

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
