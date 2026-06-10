import type Database from "better-sqlite3";
import { detectPlatformFromUrl, isListingUrl } from "shared/detect-platform";
import { ScraperFetchError, type FetcherDeps } from "../scraper/fetcher";
import {
  extractSearchQueryFromTitle,
  parseListingDetailHtml,
  type ListingDetail,
} from "../scraper/listing-detail";
import { createScraperRuntime } from "../scraper/runtime";
import {
  findSearchResults,
  getSearchStats,
  persistScrapeSearch,
} from "../searches/repository";
import { analyzePrices } from "../stats/price-analysis";
import { runAgent } from "../ai/run-agent";
import { buildFlipUserPrompt } from "./prompts";
import {
  InvalidFlipInputError,
  ListingScrapeError,
  UnsupportedListingUrlError,
} from "../errors";

export interface AnalyzeFlipInput {
  url: string;
  scraperDeps?: FetcherDeps;
}

import type {
  AnalyzeFlipResult,
  FlipMarketSample,
} from "shared/flipping-types";

export type {
  AnalyzeFlipResult,
  FlipMarketSample,
} from "shared/flipping-types";

const EMPTY_MARKET_STATS = analyzePrices([]);

async function fetchMarketData(
  db: Database.Database,
  runtime: ReturnType<typeof createScraperRuntime>,
  query: string,
): Promise<{
  marketStats: ReturnType<typeof getSearchStats>;
  marketSamples: FlipMarketSample[];
}> {
  try {
    const { results: scraped } = await runtime.scrapeSearch(query, "both");
    const searchId = persistScrapeSearch(db, query, "both", scraped);
    const marketStats = getSearchStats(db, searchId);
    const marketSamples = findSearchResults(db, searchId) as Array<{
      title: string;
      price: number;
      platform: string;
      condition: string | null;
    }>;

    const samples: FlipMarketSample[] = marketSamples
      .filter((row) => row.price > 0)
      .slice(0, 20)
      .map((row) => ({
        title: row.title,
        price: row.price,
        platform: row.platform,
        condition: row.condition,
      }));

    return { marketStats, marketSamples: samples };
  } catch (error) {
    if (error instanceof ScraperFetchError) {
      return { marketStats: EMPTY_MARKET_STATS, marketSamples: [] };
    }
    throw error;
  }
}

export async function analyzeFlip(
  db: Database.Database,
  input: AnalyzeFlipInput,
): Promise<AnalyzeFlipResult> {
  const raw = input.url?.trim() ?? "";
  if (!raw) {
    throw new InvalidFlipInputError();
  }

  if (!isListingUrl(raw)) {
    throw new UnsupportedListingUrlError();
  }

  const platform = detectPlatformFromUrl(raw);
  if (!platform) {
    throw new UnsupportedListingUrlError();
  }

  const runtime = createScraperRuntime(db, input.scraperDeps ?? {});
  const html = await runtime.fetchPage(raw);
  const listing = parseListingDetailHtml(html, raw, platform);
  if (!listing) {
    throw new ListingScrapeError();
  }

  const query = extractSearchQueryFromTitle(listing.title) || listing.title;
  const { marketStats, marketSamples } = await fetchMarketData(
    db,
    runtime,
    query,
  );

  const userInput = buildFlipUserPrompt({
    query,
    listing,
    marketStats,
    marketSamples,
  });

  const { content: analysis } = await runAgent(db, {
    agentType: "analytics",
    userInput,
    mode: "required",
  });

  return {
    analysis,
    query,
    listing,
    marketStats,
    marketSamples,
  };
}
