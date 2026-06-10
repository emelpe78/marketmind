import type Database from "better-sqlite3";
import type { FlipMarketSample } from "shared/flipping-types";
import { EMPTY_PRICE_STATS, type PriceStats } from "shared/price-stats";
import { getSearchStats, persistScrapeSearch } from "../searches/repository";
import { analyzePrices } from "../stats/price-analysis";
import { ScraperFetchError } from "./fetcher";
import type { ScraperRuntime, ScrapePlatform } from "./runtime";

export interface MarketContext {
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
}

export async function scrapeMarketContext(
  runtime: ScraperRuntime,
  query: string,
  platform: ScrapePlatform,
  options?: {
    persist?: boolean;
    db?: Database.Database;
    sampleLimit?: number;
  },
): Promise<MarketContext> {
  const sampleLimit = options?.sampleLimit ?? 20;

  try {
    const { results: scraped } = await runtime.scrapeSearch(query, platform);

    let marketStats: PriceStats;
    if (options?.persist && options.db) {
      const searchId = persistScrapeSearch(
        options.db,
        query,
        platform,
        scraped,
      );
      marketStats = getSearchStats(options.db, searchId);
    } else {
      marketStats = analyzePrices(
        scraped.map((row) => ({
          price: row.price,
          condition: row.condition ?? null,
          platform: row.platform,
          sold: row.sold ?? 0,
        })),
      );
    }

    const marketSamples: FlipMarketSample[] = scraped
      .filter((row) => row.price > 0)
      .slice(0, sampleLimit)
      .map((row) => ({
        title: row.title,
        price: row.price,
        platform: row.platform,
        condition: row.condition ?? null,
      }));

    return { marketStats, marketSamples };
  } catch (error) {
    if (error instanceof ScraperFetchError) {
      return { marketStats: EMPTY_PRICE_STATS, marketSamples: [] };
    }
    throw error;
  }
}
