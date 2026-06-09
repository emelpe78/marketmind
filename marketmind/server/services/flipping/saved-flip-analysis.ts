import type Database from "better-sqlite3";
import type { PriceStats } from "../stats/price-analysis";
import type { FlipMarketSample } from "./analyze-flip";

export interface SavedFlipListing {
  platform: string;
  url: string;
  title: string;
  price: number | null;
  condition: string | null;
  location: string | null;
  category?: string | null;
  description?: string | null;
}

export interface SavedFlipAnalysis {
  id: number;
  title: string;
  listingUrl: string;
  listingPlatform: string;
  query: string;
  analysis: string;
  listing: SavedFlipListing;
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
  createdAt: string;
  updatedAt: string;
}

interface SavedFlipAnalysisRow {
  id: number;
  title: string;
  listing_url: string;
  listing_platform: string;
  query: string;
  analysis: string;
  listing_json: string;
  market_stats_json: string;
  market_samples_json: string;
  created_at: string;
  updated_at: string;
}

const EMPTY_STATS: PriceStats = {
  min: 0,
  max: 0,
  avg: 0,
  median: 0,
  count: 0,
  histogram: [],
  conditionBreakdown: {},
  platformComparison: {},
  demandIndicator: 0,
};

function parseJson<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function rowToSavedFlipAnalysis(row: SavedFlipAnalysisRow): SavedFlipAnalysis {
  return {
    id: row.id,
    title: row.title,
    listingUrl: row.listing_url,
    listingPlatform: row.listing_platform,
    query: row.query,
    analysis: row.analysis,
    listing: parseJson<SavedFlipListing>(row.listing_json, {
      platform: row.listing_platform,
      url: row.listing_url,
      title: row.title,
      price: null,
      condition: null,
      location: null,
    }),
    marketStats: parseJson<PriceStats>(row.market_stats_json, EMPTY_STATS),
    marketSamples: parseJson<FlipMarketSample[]>(row.market_samples_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listSavedFlipAnalyses(
  db: Database.Database,
): SavedFlipAnalysis[] {
  const rows = db
    .prepare("SELECT * FROM saved_flip_analyses ORDER BY updated_at DESC")
    .all() as SavedFlipAnalysisRow[];
  return rows.map(rowToSavedFlipAnalysis);
}

export function getSavedFlipAnalysis(
  db: Database.Database,
  id: number,
): SavedFlipAnalysis | null {
  const row = db
    .prepare("SELECT * FROM saved_flip_analyses WHERE id = ?")
    .get(id) as SavedFlipAnalysisRow | undefined;
  return row ? rowToSavedFlipAnalysis(row) : null;
}

export interface CreateSavedFlipAnalysisInput {
  title?: string;
  listingUrl: string;
  listingPlatform: string;
  query: string;
  analysis: string;
  listing: SavedFlipListing;
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
}

export function createSavedFlipAnalysis(
  db: Database.Database,
  input: CreateSavedFlipAnalysisInput,
): SavedFlipAnalysis {
  const title = input.title?.trim() || input.listing.title.trim();
  const result = db
    .prepare(
      `INSERT INTO saved_flip_analyses
        (title, listing_url, listing_platform, query, analysis, listing_json, market_stats_json, market_samples_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      title,
      input.listingUrl.trim(),
      input.listingPlatform,
      input.query.trim(),
      input.analysis,
      JSON.stringify(input.listing),
      JSON.stringify(input.marketStats),
      JSON.stringify(input.marketSamples),
    );

  return getSavedFlipAnalysis(db, Number(result.lastInsertRowid))!;
}

export function updateSavedFlipAnalysis(
  db: Database.Database,
  id: number,
  input: { title: string },
): SavedFlipAnalysis | null {
  const existing = getSavedFlipAnalysis(db, id);
  if (!existing) return null;

  db.prepare(
    "UPDATE saved_flip_analyses SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(input.title.trim(), id);

  return getSavedFlipAnalysis(db, id);
}

export function deleteSavedFlipAnalysis(
  db: Database.Database,
  id: number,
): boolean {
  const result = db
    .prepare("DELETE FROM saved_flip_analyses WHERE id = ?")
    .run(id);
  return result.changes > 0;
}
