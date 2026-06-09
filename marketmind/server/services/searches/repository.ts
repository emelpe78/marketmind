import type Database from "better-sqlite3";
import { analyzePrices } from "../stats/price-analysis";

export function findAllSearches(db: Database.Database) {
  return db.prepare("SELECT * FROM searches ORDER BY timestamp DESC").all();
}

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

export function createSearchResult(
  db: Database.Database,
  body: {
    search_id: number;
    title: string;
    price: number;
    url: string;
    platform: string;
    condition?: string | null;
    sold?: number;
    location?: string | null;
    end_date?: string | null;
  },
) {
  const result = db
    .prepare(
      `INSERT INTO search_results (search_id, title, price, url, platform, condition, sold, location, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.search_id,
      body.title,
      body.price,
      body.url,
      body.platform,
      body.condition ?? null,
      body.sold ?? 0,
      body.location ?? null,
      body.end_date ?? null,
    );
  return db
    .prepare("SELECT * FROM search_results WHERE id = ?")
    .get(result.lastInsertRowid);
}

export function updateSearchResult(
  db: Database.Database,
  id: number,
  body: Record<string, unknown>,
) {
  db.prepare(
    `UPDATE search_results SET title=?, price=?, url=?, platform=?, condition=? WHERE id=?`,
  ).run(
    body.title,
    body.price,
    body.url,
    body.platform,
    body.condition ?? null,
    id,
  );
  return db.prepare("SELECT * FROM search_results WHERE id = ?").get(id);
}

export function deleteSearchResult(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM search_results WHERE id = ?").run(id);
  return result.changes > 0;
}
