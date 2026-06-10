import type Database from "better-sqlite3";
import type {
  ResearchRunSummary,
  SavedResearchListItem,
} from "shared/research-types";
import { EMPTY_PRICE_STATS, type PriceStats } from "shared/price-stats";
import { parseJsonColumn } from "../persistence/json-row";

export interface SavedResearchResult {
  title: string;
  price: number;
  url: string;
  platform: string;
  condition?: string | null;
}

export type SavedResearchAnalysis = ResearchRunSummary;

export function countSavedResearches(db: Database.Database): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM saved_researches")
    .get() as { count: number };
  return row.count;
}

export interface SavedResearch {
  id: number;
  title: string;
  query: string;
  platform: string;
  searchId: number | null;
  stats: PriceStats;
  results: SavedResearchResult[];
  analyses: SavedResearchAnalysis[];
  createdAt: string;
  updatedAt: string;
}

interface SavedResearchRow {
  id: number;
  title: string;
  query: string;
  platform: string;
  search_id: number | null;
  stats_json: string;
  results_json: string;
  analyses_json: string | null;
  created_at: string;
  updated_at: string;
}

function rowToSavedResearch(row: SavedResearchRow): SavedResearch {
  return {
    id: row.id,
    title: row.title,
    query: row.query,
    platform: row.platform,
    searchId: row.search_id,
    stats: parseJsonColumn<PriceStats>(row.stats_json, EMPTY_PRICE_STATS),
    results: parseJsonColumn<SavedResearchResult[]>(row.results_json, []),
    analyses: parseJsonColumn<SavedResearchAnalysis[]>(row.analyses_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toSavedResearchListItem(
  research: SavedResearch,
): SavedResearchListItem {
  return {
    id: research.id,
    title: research.title,
    query: research.query,
    platform: research.platform,
    resultsCount: research.results.length,
    createdAt: research.createdAt,
    updatedAt: research.updatedAt,
  };
}

export function listSavedResearches(db: Database.Database): SavedResearch[] {
  const rows = db
    .prepare("SELECT * FROM saved_researches ORDER BY updated_at DESC")
    .all() as SavedResearchRow[];
  return rows.map(rowToSavedResearch);
}

export function listSavedResearchItems(
  db: Database.Database,
): SavedResearchListItem[] {
  return listSavedResearches(db).map(toSavedResearchListItem);
}

export function getSavedResearch(
  db: Database.Database,
  id: number,
): SavedResearch | null {
  const row = db
    .prepare("SELECT * FROM saved_researches WHERE id = ?")
    .get(id) as SavedResearchRow | undefined;
  return row ? rowToSavedResearch(row) : null;
}

export interface CreateSavedResearchInput {
  title?: string;
  query: string;
  platform: string;
  searchId?: number | null;
  stats: PriceStats;
  results: SavedResearchResult[];
  analyses?: SavedResearchAnalysis[];
}

export function createSavedResearch(
  db: Database.Database,
  input: CreateSavedResearchInput,
): SavedResearch {
  const title = input.title?.trim() || input.query.trim();
  const result = db
    .prepare(
      `INSERT INTO saved_researches
        (title, query, platform, search_id, stats_json, results_json, analyses_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      title,
      input.query.trim(),
      input.platform,
      input.searchId ?? null,
      JSON.stringify(input.stats),
      JSON.stringify(input.results),
      JSON.stringify(input.analyses ?? []),
    );

  return getSavedResearch(db, Number(result.lastInsertRowid))!;
}

export function updateSavedResearch(
  db: Database.Database,
  id: number,
  input: { title: string },
): SavedResearch | null {
  const existing = getSavedResearch(db, id);
  if (!existing) return null;

  db.prepare(
    "UPDATE saved_researches SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(input.title.trim(), id);

  return getSavedResearch(db, id);
}

export function deleteSavedResearch(
  db: Database.Database,
  id: number,
): boolean {
  const result = db
    .prepare("DELETE FROM saved_researches WHERE id = ?")
    .run(id);
  return result.changes > 0;
}
