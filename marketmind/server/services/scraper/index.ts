import type Database from "better-sqlite3";
import { buildEbaySearchUrl, parseEbayHtml } from "./ebay";
import {
  buildKleinanzeigenSearchUrl,
  parseKleinanzeigenHtml,
} from "./kleinanzeigen";
import {
  fetchWithConfig,
  createFetcherSession,
  invalidateCachedHtml,
  type FetcherConfig,
  type FetcherDeps,
} from "./fetcher";
import { getAllSettings } from "../../database/seed";

export type ScrapePlatform = "ebay" | "kleinanzeigen" | "both";

export interface ScrapeResult {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string;
  sold?: number;
  location?: string;
  end_date?: string | null;
}

function getFetcherConfig(settings: Record<string, string>): FetcherConfig {
  return {
    delayMinMs: Number(settings["scraper-delay-min"] || 2) * 1000,
    delayMaxMs: Number(settings["scraper-delay-max"] || 5) * 1000,
    userAgentRotation: settings["scraper-user-agent-rotation"] === "true",
    cacheTtlHours: Number(settings["scraper-cache-ttl-hours"] || 6),
    proxyEnabled: settings["scraper-proxy-enabled"] === "true",
    proxyHost: settings["scraper-proxy-host"] || "",
    proxyPort: settings["scraper-proxy-port"] || "",
    proxyAuth: settings["scraper-proxy-auth"] || "",
  };
}

function scraperDeps(deps: FetcherDeps = {}): FetcherDeps {
  return {
    session: deps.session ?? createFetcherSession(),
    skipWarmUp: deps.skipWarmUp,
    fetchFn: deps.fetchFn,
    sleepFn: deps.sleepFn,
    randomFn: deps.randomFn,
    uaIndex: deps.uaIndex,
  };
}

export async function scrapeEbay(
  db: Database.Database,
  query: string,
  maxResults: number,
  deps: FetcherDeps = {},
): Promise<ScrapeResult[]> {
  const settings = getAllSettings(db);
  const config = getFetcherConfig(settings);
  const results: ScrapeResult[] = [];
  let page = 1;

  while (results.length < maxResults) {
    const url = buildEbaySearchUrl(query, page);
    let html = await fetchWithConfig(db, url, config, scraperDeps(deps));
    let items = parseEbayHtml(html);

    if (!items.length && html.length > 50_000) {
      invalidateCachedHtml(db, url);
      html = await fetchWithConfig(db, url, config, {
        ...scraperDeps(deps),
        skipWarmUp: true,
      });
      items = parseEbayHtml(html);
    }

    if (!items.length) break;

    for (const item of items) {
      if (results.length >= maxResults) break;
      results.push({
        title: item.title,
        price: item.price,
        url: item.url,
        platform: "ebay",
        condition: item.condition,
        sold: 1,
        end_date: item.endDate,
      });
    }
    page++;
    if (page > 10) break;
  }
  return results;
}

export async function scrapeKleinanzeigen(
  db: Database.Database,
  query: string,
  maxResults: number,
  deps: FetcherDeps = {},
): Promise<ScrapeResult[]> {
  const settings = getAllSettings(db);
  const config = getFetcherConfig(settings);
  const results: ScrapeResult[] = [];
  let page = 1;

  while (results.length < maxResults) {
    const url = buildKleinanzeigenSearchUrl(query, page);
    let html = await fetchWithConfig(db, url, config, scraperDeps(deps));
    let items = parseKleinanzeigenHtml(html);

    if (
      items.length > 0 &&
      items.every((item) => item.price === 0) &&
      html.includes("aditem-main--middle--price-shipping--price")
    ) {
      invalidateCachedHtml(db, url);
      html = await fetchWithConfig(db, url, config, {
        ...scraperDeps(deps),
        skipWarmUp: true,
      });
      items = parseKleinanzeigenHtml(html);
    }

    if (!items.length) break;

    for (const item of items) {
      if (results.length >= maxResults) break;
      results.push({
        title: item.title,
        price: item.price,
        url: item.url,
        platform: "kleinanzeigen",
        location: item.location,
      });
    }
    page++;
    if (page > 10) break;
  }
  return results;
}

export async function runSearch(
  db: Database.Database,
  query: string,
  platform: ScrapePlatform,
  deps: FetcherDeps = {},
): Promise<{ searchId: number; results: ScrapeResult[] }> {
  const settings = getAllSettings(db);
  const maxResults = Number(settings["scraper-max-results"] || 100);

  const insertSearch = db.prepare(
    "INSERT INTO searches (query, platform) VALUES (?, ?)",
  );
  const searchResult = insertSearch.run(query, platform);
  const searchId = Number(searchResult.lastInsertRowid);

  let allResults: ScrapeResult[] = [];

  if (platform === "ebay" || platform === "both") {
    allResults = allResults.concat(
      await scrapeEbay(db, query, maxResults, deps),
    );
  }
  if (platform === "kleinanzeigen" || platform === "both") {
    const kaMax = platform === "both" ? Math.floor(maxResults / 2) : maxResults;
    allResults = allResults.concat(
      await scrapeKleinanzeigen(db, query, kaMax, deps),
    );
  }

  const insertResult = db.prepare(
    `INSERT INTO search_results (search_id, title, price, url, platform, condition, sold, location, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const r of allResults) {
    insertResult.run(
      searchId,
      r.title,
      r.price,
      r.url,
      r.platform,
      r.condition ?? null,
      r.sold ?? 0,
      r.location ?? null,
      r.end_date ?? null,
    );
  }

  db.prepare("UPDATE searches SET results_count = ? WHERE id = ?").run(
    allResults.length,
    searchId,
  );

  return { searchId, results: allResults };
}
