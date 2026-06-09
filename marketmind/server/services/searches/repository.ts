import type Database from "better-sqlite3";
import { analyzePrices } from "../stats/price-analysis";

export function findRecentSearches(db: Database.Database, limit = 5) {
  return db
    .prepare("SELECT * FROM searches ORDER BY timestamp DESC LIMIT ?")
    .all(limit);
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
