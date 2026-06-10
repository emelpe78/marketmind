import type Database from "better-sqlite3";
import { parsePriceValue } from "./parse-generation";

export interface ListingInput {
  query: string;
  platform: string;
  title: string;
  description: string;
  price_suggestion?: unknown;
  category?: string | null;
  keywords?: string | null;
}

export function countListings(db: Database.Database): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM listings").get() as {
    count: number;
  };
  return row.count;
}

export function findAllListings(db: Database.Database) {
  return db.prepare("SELECT * FROM listings ORDER BY created_at DESC").all();
}

export function findListingById(db: Database.Database, id: number) {
  return db.prepare("SELECT * FROM listings WHERE id = ?").get(id);
}

export function createListing(db: Database.Database, body: ListingInput) {
  const result = db
    .prepare(
      `INSERT INTO listings (query, platform, title, description, price_suggestion, category, keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.query,
      body.platform,
      body.title,
      body.description,
      parsePriceValue(body.price_suggestion),
      body.category ?? null,
      body.keywords ?? null,
    );
  return findListingById(db, Number(result.lastInsertRowid));
}

export function updateListing(
  db: Database.Database,
  id: number,
  body: Partial<ListingInput>,
) {
  const existing = findListingById(db, id) as ListingInput & { id: number };
  if (!existing) return null;

  db.prepare(
    `UPDATE listings SET query=?, platform=?, title=?, description=?, price_suggestion=?, category=?, keywords=? WHERE id=?`,
  ).run(
    body.query ?? existing.query,
    body.platform ?? existing.platform,
    body.title ?? existing.title,
    body.description ?? existing.description,
    body.price_suggestion !== undefined
      ? parsePriceValue(body.price_suggestion)
      : parsePriceValue(
          (existing as { price_suggestion?: unknown }).price_suggestion,
        ),
    body.category ?? (existing as { category?: string }).category ?? null,
    body.keywords ?? (existing as { keywords?: string }).keywords ?? null,
    id,
  );
  return findListingById(db, id);
}

export function deleteListing(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM listings WHERE id = ?").run(id);
  return result.changes > 0;
}
