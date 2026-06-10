import type Database from "better-sqlite3";
import { normalizeInventoryPlatform } from "shared/detect-platform";
import { calculateProfit, type InventoryItem } from "./index";

export interface InventoryFilters {
  status?: string;
  platform?: string;
  from?: string;
  to?: string;
}

export function findAllInventory(
  db: Database.Database,
  filters: InventoryFilters = {},
) {
  let sql = "SELECT * FROM inventory WHERE 1=1";
  const params: unknown[] = [];

  if (filters.status) {
    sql += " AND status = ?";
    params.push(filters.status);
  }
  if (filters.platform) {
    sql += " AND (buy_platform = ? OR sell_platform = ?)";
    params.push(filters.platform, filters.platform);
  }
  if (filters.from) {
    sql += " AND buy_date >= ?";
    params.push(filters.from);
  }
  if (filters.to) {
    sql += " AND buy_date <= ?";
    params.push(filters.to);
  }
  sql += " ORDER BY created_at DESC";

  const rows = db.prepare(sql).all(...params) as InventoryItem[];
  return rows.map((row) => ({
    ...row,
    profit: calculateProfit(row),
  }));
}

export function findInventoryById(db: Database.Database, id: number) {
  const row = db.prepare("SELECT * FROM inventory WHERE id = ?").get(id) as
    | InventoryItem
    | undefined;
  if (!row) return null;
  return { ...row, profit: calculateProfit(row) };
}

export function createInventory(db: Database.Database, body: InventoryItem) {
  const profit = calculateProfit(body);
  const result = db
    .prepare(
      `INSERT INTO inventory (title, buy_price, buy_platform, buy_date, sell_price, sell_platform, sell_date, status, profit, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      body.title,
      body.buy_price ?? null,
      normalizeInventoryPlatform(body.buy_platform),
      body.buy_date ?? null,
      body.sell_price ?? null,
      normalizeInventoryPlatform(body.sell_platform),
      body.sell_date ?? null,
      body.status ?? "gekauft",
      profit,
      body.notes ?? null,
    );
  return findInventoryById(db, Number(result.lastInsertRowid));
}

export function updateInventory(
  db: Database.Database,
  id: number,
  body: InventoryItem,
) {
  const profit = calculateProfit(body);
  db.prepare(
    `UPDATE inventory SET title=?, buy_price=?, buy_platform=?, buy_date=?, sell_price=?, sell_platform=?, sell_date=?, status=?, profit=?, notes=? WHERE id=?`,
  ).run(
    body.title,
    body.buy_price ?? null,
    normalizeInventoryPlatform(body.buy_platform),
    body.buy_date ?? null,
    body.sell_price ?? null,
    normalizeInventoryPlatform(body.sell_platform),
    body.sell_date ?? null,
    body.status ?? "gekauft",
    profit,
    body.notes ?? null,
    id,
  );
  return findInventoryById(db, id);
}

export function countOpenInventory(db: Database.Database): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM inventory WHERE status = 'gekauft'")
    .get() as { count: number };
  return row.count;
}

export function deleteInventory(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM inventory WHERE id = ?").run(id);
  return result.changes > 0;
}
