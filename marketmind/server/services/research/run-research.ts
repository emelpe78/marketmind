import type Database from "better-sqlite3";
import { createScraperRuntime } from "../scraper/runtime";
import type { ScrapePlatform } from "../scraper/runtime";
import { analyzePrices, type PriceStats } from "../stats/price-analysis";
import { analyzeSearchByPlatform } from "./analyze-search";
import { createSavedResearch } from "./saved-research";

export interface ResearchRunResultRow {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

export interface ResearchRunSummary {
  platform: "ebay" | "kleinanzeigen";
  summary: string;
}

export interface ResearchRunInput {
  query?: string;
  platform?: ScrapePlatform;
  searchId?: number;
  analyze?: boolean;
  save?: boolean;
  saveName?: string;
}

export interface ResearchRunResult {
  searchId: number;
  results: ResearchRunResultRow[];
  stats: PriceStats;
  summaries?: ResearchRunSummary[];
  savedResearchId?: number;
}

function loadSearchResults(
  db: Database.Database,
  searchId: number,
): ResearchRunResultRow[] {
  return db
    .prepare(
      "SELECT title, price, url, platform, condition FROM search_results WHERE search_id = ?",
    )
    .all(searchId) as ResearchRunResultRow[];
}

function loadStats(db: Database.Database, searchId: number): PriceStats {
  const rows = db
    .prepare(
      "SELECT price, condition, platform, sold FROM search_results WHERE search_id = ?",
    )
    .all(searchId) as {
    price: number;
    condition: string;
    platform: string;
    sold: number;
  }[];
  return analyzePrices(rows);
}

export async function runResearch(
  db: Database.Database,
  input: ResearchRunInput,
): Promise<ResearchRunResult> {
  let searchId = input.searchId;
  let query = input.query?.trim() ?? "";
  let platform = input.platform ?? "both";
  let results: ResearchRunResultRow[] = [];

  if (searchId) {
    const search = db
      .prepare("SELECT query, platform FROM searches WHERE id = ?")
      .get(searchId) as { query: string; platform: string } | undefined;
    if (!search) {
      throw createError({ statusCode: 404, message: "Suche nicht gefunden" });
    }
    query = search.query;
    platform = search.platform as ScrapePlatform;
    results = loadSearchResults(db, searchId);
  } else {
    if (!query) {
      throw createError({ statusCode: 400, message: "Suchbegriff fehlt" });
    }
    const runtime = createScraperRuntime(db);
    const searchResult = await runtime.runSearch(query, platform);
    searchId = searchResult.searchId;
    results = searchResult.results.map((r) => ({
      title: r.title,
      price: r.price,
      url: r.url,
      platform: r.platform,
      condition: r.condition ?? null,
    }));
  }

  const stats = loadStats(db, searchId);
  let summaries: ResearchRunSummary[] | undefined;
  let savedResearchId: number | undefined;

  if (input.analyze) {
    const { summaries: platformSummaries } = await analyzeSearchByPlatform(
      db,
      searchId,
      { query, platform },
    );
    if (!platformSummaries.length) {
      throw createError({
        statusCode: 400,
        message: "Keine Preisdaten für die Analyse vorhanden",
      });
    }
    summaries = platformSummaries;
  }

  if (input.save) {
    const saved = createSavedResearch(db, {
      title: input.saveName,
      query,
      platform,
      searchId,
      stats,
      results,
      analyses: summaries ?? [],
    });
    savedResearchId = saved.id;
  }

  return {
    searchId,
    results,
    stats,
    summaries,
    savedResearchId,
  };
}
