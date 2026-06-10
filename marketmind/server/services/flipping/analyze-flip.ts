import type Database from "better-sqlite3";
import { detectPlatformFromUrl, isListingUrl } from "shared/detect-platform";
import type {
  AnalyzeFlipResult,
  FlipMarketSample,
} from "shared/flipping-types";
import { createScraperRuntime } from "../scraper/runtime";
import type { FetcherDeps } from "../scraper/fetcher";
import {
  extractSearchQueryFromTitle,
  parseListingDetailHtml,
} from "../scraper/listing-detail";
import { scrapeMarketContext } from "../scraper/market-context";
import { runAgent } from "../ai/run-agent";
import { buildFlipUserPrompt } from "./prompts";
import {
  InvalidFlipInputError,
  ListingScrapeError,
  UnsupportedListingUrlError,
} from "../errors";

export type {
  AnalyzeFlipResult,
  FlipMarketSample,
} from "shared/flipping-types";

export interface AnalyzeFlipInput {
  url: string;
  scraperDeps?: FetcherDeps;
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
  const { marketStats, marketSamples } = await scrapeMarketContext(
    runtime,
    query,
    "both",
    { persist: false },
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
