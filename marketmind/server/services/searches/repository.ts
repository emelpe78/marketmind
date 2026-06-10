import type Database from "better-sqlite3";
import type { ResearchRunSummary } from "shared/research-types";
import type { ScrapePlatform, ScrapeResult } from "../scraper/runtime";
import { analyzePrices } from "../stats/price-analysis";

export function createSearch(
  db: Database.Database,
  query: string,
  platform: ScrapePlatform,
): number {
  const result = db
    .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
    .run(query, platform);
  return Number(result.lastInsertRowid);
}

export function insertSearchResults(
  db: Database.Database,
  searchId: number,
  results: ScrapeResult[],
): void {
  const insertResult = db.prepare(
    `INSERT INTO search_results (search_id, title, price, url, platform, condition, sold, location, end_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const r of results) {
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
}

export function updateSearchResultsCount(
  db: Database.Database,
  searchId: number,
  count: number,
): void {
  db.prepare("UPDATE searches SET results_count = ? WHERE id = ?").run(
    count,
    searchId,
  );
}

export function persistScrapeSearch(
  db: Database.Database,
  query: string,
  platform: ScrapePlatform,
  results: ScrapeResult[],
): number {
  const searchId = createSearch(db, query, platform);
  insertSearchResults(db, searchId, results);
  updateSearchResultsCount(db, searchId, results.length);
  return searchId;
}

export function findRecentSearches(db: Database.Database, limit = 5) {
  return db
    .prepare("SELECT * FROM searches ORDER BY timestamp DESC LIMIT ?")
    .all(limit);
}

export function saveSearchAnalyses(
  db: Database.Database,
  searchId: number,
  analyses: ResearchRunSummary[],
): void {
  db.prepare("UPDATE searches SET analyses_json = ? WHERE id = ?").run(
    JSON.stringify(analyses),
    searchId,
  );
}

export function getSearchAnalyses(
  db: Database.Database,
  searchId: number,
): ResearchRunSummary[] {
  const row = db
    .prepare("SELECT analyses_json FROM searches WHERE id = ?")
    .get(searchId) as { analyses_json: string | null } | undefined;
  if (!row?.analyses_json) return [];
  try {
    return JSON.parse(row.analyses_json) as ResearchRunSummary[];
  } catch {
    return [];
  }
}

export function findSearchById(db: Database.Database, id: number) {
  return db.prepare("SELECT * FROM searches WHERE id = ?").get(id) as
    | { query: string; platform: string }
    | undefined;
}

export function getSearchStats(db: Database.Database, searchId: number) {
  const results = db
    .prepare(
      "SELECT price, condition, platform, sold FROM search_results WHERE search_id = ?",
    )
    .all(searchId) as {
    price: number;
    condition: string;
    platform: string;
    sold: number;
  }[];
  return analyzePrices(results);
}

export interface PricedSearchResultRow {
  title: string;
  price: number;
  condition: string | null;
  platform: string;
}

export function findPricedResultsForPlatform(
  db: Database.Database,
  searchId: number,
  platform: "ebay" | "kleinanzeigen",
  limit = 20,
): PricedSearchResultRow[] {
  return db
    .prepare(
      `SELECT title, price, condition, platform
       FROM search_results
       WHERE search_id = ? AND platform = ? AND price > 0
       ORDER BY price ASC
       LIMIT ?`,
    )
    .all(searchId, platform, limit) as PricedSearchResultRow[];
}

export function findSearchResults(
  db: Database.Database,
  searchId?: number | null,
) {
  if (searchId) {
    return db
      .prepare(
        "SELECT * FROM search_results WHERE search_id = ? ORDER BY price ASC",
      )
      .all(searchId);
  }
  return db
    .prepare("SELECT * FROM search_results ORDER BY timestamp DESC")
    .all();
}
