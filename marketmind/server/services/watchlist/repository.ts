import type Database from "better-sqlite3";
import { detectPlatformFromUrl } from "shared/detect-platform";
import { checkAlert } from "./alerts";

export interface WatchlistItem {
  id: number;
  title: string;
  url: string | null;
  platform: string | null;
  target_price: number | null;
  current_price: number | null;
  alert_active: number;
  status: string;
  last_scraped: string | null;
  created_at: string;
}

export interface WatchlistItemWithAlert extends WatchlistItem {
  alertTriggered: boolean;
}

function mapWithAlert(item: WatchlistItem): WatchlistItemWithAlert {
  return {
    ...item,
    alertTriggered: checkAlert(
      item.current_price,
      item.target_price,
      item.alert_active,
    ),
  };
}

export function findAllWatchlist(
  db: Database.Database,
): WatchlistItemWithAlert[] {
  const items = db
    .prepare("SELECT * FROM watchlist ORDER BY created_at DESC")
    .all() as WatchlistItem[];
  return items.map(mapWithAlert);
}

export function findWatchlistById(db: Database.Database, id: number) {
  const item = db.prepare("SELECT * FROM watchlist WHERE id = ?").get(id) as
    | WatchlistItem
    | undefined;
  return item ? mapWithAlert(item) : null;
}

export function createWatchlistItem(
  db: Database.Database,
  body: {
    title: string;
    url?: string | null;
    target_price?: number | null;
    status?: string;
  },
) {
  const url = body.url ?? null;
  const result = db
    .prepare(
      "INSERT INTO watchlist (title, url, platform, target_price, status) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      body.title,
      url,
      detectPlatformFromUrl(url),
      body.target_price ?? null,
      body.status ?? "aktiv",
    );
  return findWatchlistById(db, Number(result.lastInsertRowid));
}

export function updateWatchlistItem(
  db: Database.Database,
  id: number,
  body: {
    title?: string;
    url?: string | null;
    target_price?: number | null;
    current_price?: number | null;
    alert_active?: number;
    status?: string;
  },
) {
  const existing = db
    .prepare("SELECT * FROM watchlist WHERE id = ?")
    .get(id) as WatchlistItem | undefined;
  if (!existing) return null;

  const url = body.url !== undefined ? body.url : existing.url;
  db.prepare(
    `UPDATE watchlist SET title=?, url=?, platform=?, target_price=?, current_price=?, alert_active=?, status=? WHERE id=?`,
  ).run(
    body.title ?? existing.title,
    url,
    detectPlatformFromUrl(url),
    body.target_price ?? existing.target_price,
    body.current_price ?? existing.current_price,
    body.alert_active ?? existing.alert_active,
    body.status ?? existing.status,
    id,
  );
  return findWatchlistById(db, id);
}

export function deleteWatchlistItem(
  db: Database.Database,
  id: number,
): boolean {
  const result = db.prepare("DELETE FROM watchlist WHERE id = ?").run(id);
  return result.changes > 0;
}

export function findWatchlistHistory(
  db: Database.Database,
  watchlistId: number,
) {
  return db
    .prepare(
      "SELECT * FROM watchlist_history WHERE watchlist_id = ? ORDER BY scraped_at ASC",
    )
    .all(watchlistId);
}

export function findActiveWatchlistItems(
  db: Database.Database,
): WatchlistItem[] {
  return db
    .prepare("SELECT * FROM watchlist WHERE status = 'aktiv'")
    .all() as WatchlistItem[];
}
