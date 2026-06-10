import type Database from "better-sqlite3";
import { createScraperRuntime } from "../scraper/runtime";
import type { ScrapePlatform } from "../scraper/runtime";
import type { FetcherDeps } from "../scraper/fetcher";
import type {
  ResearchRunResult,
  ResearchRunResultRow,
  ResearchRunSummary,
} from "shared/research-types";
import {
  findSearchById,
  findSearchResults,
  getSearchAnalyses,
  getSearchStats,
  persistScrapeSearch,
  saveSearchAnalyses,
} from "../searches/repository";
import {
  MissingQueryError,
  NoAnalysisDataError,
  SearchNotFoundError,
} from "../errors";
import { analyzeSearchByPlatform } from "./analyze-search";
import { createSavedResearch } from "./saved-research";

export type {
  ResearchRunResult,
  ResearchRunResultRow,
  ResearchRunSummary,
} from "shared/research-types";

export interface ResearchRunInput {
  query?: string;
  platform?: ScrapePlatform;
  searchId?: number;
  analyze?: boolean;
  save?: boolean;
  saveName?: string;
  scraperDeps?: FetcherDeps;
}

function mapSearchResults(
  rows: Array<Record<string, unknown>>,
): ResearchRunResultRow[] {
  return rows.map((row) => ({
    title: String(row.title ?? ""),
    price: Number(row.price),
    url: String(row.url ?? ""),
    platform: String(row.platform ?? ""),
    condition: (row.condition as string | null | undefined) ?? null,
  }));
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
    const search = findSearchById(db, searchId);
    if (!search) {
      throw new SearchNotFoundError();
    }
    query = search.query;
    platform = search.platform as ScrapePlatform;
    results = mapSearchResults(
      findSearchResults(db, searchId) as Array<Record<string, unknown>>,
    );
  } else {
    if (!query) {
      throw new MissingQueryError();
    }
    const runtime = createScraperRuntime(db, input.scraperDeps);
    const { results: scraped } = await runtime.scrapeSearch(query, platform);
    searchId = persistScrapeSearch(db, query, platform, scraped);
    results = scraped.map((r) => ({
      title: r.title,
      price: r.price,
      url: r.url,
      platform: r.platform,
      condition: r.condition ?? null,
    }));
  }

  const stats = getSearchStats(db, searchId);
  let summaries: ResearchRunSummary[] | undefined;
  let savedResearchId: number | undefined;

  if (input.analyze) {
    const { summaries: platformSummaries } = await analyzeSearchByPlatform(
      db,
      searchId,
      { query, platform },
    );
    if (!platformSummaries.length) {
      throw new NoAnalysisDataError();
    }
    summaries = platformSummaries;
    saveSearchAnalyses(db, searchId, platformSummaries);
  }

  if (input.save) {
    const analyses = summaries ?? getSearchAnalyses(db, searchId);
    if (!analyses.length) {
      throw new NoAnalysisDataError();
    }
    const saved = createSavedResearch(db, {
      title: input.saveName,
      query,
      platform,
      searchId,
      stats,
      results,
      analyses,
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
