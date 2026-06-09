import type Database from "better-sqlite3";
import { detectPlatformFromUrl, isListingUrl } from "shared/detect-platform";
import { formatEuro } from "shared/format-currency";
import { ScraperFetchError, type FetcherDeps } from "../scraper/fetcher";
import {
  extractSearchQueryFromTitle,
  parseListingDetailHtml,
  type ListingDetail,
} from "../scraper/listing-detail";
import { createScraperRuntime } from "../scraper/runtime";
import { findSearchResults, getSearchStats } from "../searches/repository";
import { analyzePrices } from "../stats/price-analysis";
import { runAgent } from "../ai/run-agent";
import {
  InvalidFlipInputError,
  ListingScrapeError,
  UnsupportedListingUrlError,
} from "../errors";

export interface AnalyzeFlipInput {
  url: string;
  scraperDeps?: FetcherDeps;
}

export interface FlipMarketSample {
  title: string;
  price: number;
  platform: string;
  condition: string | null;
}

export interface AnalyzeFlipResult {
  analysis: string;
  query: string;
  listing: ListingDetail;
  marketStats: ReturnType<typeof getSearchStats>;
  marketSamples: FlipMarketSample[];
}

const EMPTY_MARKET_STATS = analyzePrices([]);

function buildFlipAgentPrompt(input: {
  query: string;
  listing: ListingDetail;
  marketStats: ReturnType<typeof getSearchStats>;
  marketSamples: FlipMarketSample[];
}): string {
  const lines = [
    "Analysiere das Flipping-Potenzial für den deutschen Gebrauchtmarkt (privater Verkauf, keine Plattformgebühren).",
    `Suchbegriff / Produkt: ${input.query}`,
    "",
    "Quelle: konkrete Anzeige",
    JSON.stringify(
      {
        platform: input.listing.platform,
        url: input.listing.url,
        title: input.listing.title,
        price: input.listing.price,
        condition: input.listing.condition,
        location: input.listing.location,
        category: input.listing.category,
        description: input.listing.description?.slice(0, 2000) ?? null,
      },
      null,
      2,
    ),
  ];

  if (input.listing.price != null) {
    lines.push(
      `Einkaufspreis (Anzeigenpreis): ${formatEuro(input.listing.price)}`,
    );
  }

  lines.push(
    "",
    "Marktdaten (Vergleichsangebote):",
    JSON.stringify(
      {
        stats: input.marketStats,
        samples: input.marketSamples,
      },
      null,
      2,
    ),
  );

  if (input.marketStats.count === 0) {
    lines.push(
      "",
      "Hinweis: Keine Vergleichsangebote verfügbar – Einschätzungen nur auf Basis der Anzeige und Markterfahrung.",
    );
  }

  lines.push(
    "",
    "Strukturiere die Antwort mit ###-Überschriften gemäß deinem System-Prompt.",
    "Nutze die Marktdaten für Verkaufspreis-Schätzung und Nachfragebewertung.",
  );

  return lines.join("\n");
}

async function fetchMarketData(
  db: Database.Database,
  runtime: ReturnType<typeof createScraperRuntime>,
  query: string,
): Promise<{
  marketStats: ReturnType<typeof getSearchStats>;
  marketSamples: FlipMarketSample[];
}> {
  try {
    const { searchId } = await runtime.runSearch(query, "both");
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

  const userInput = buildFlipAgentPrompt({
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
