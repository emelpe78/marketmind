import { getDb } from "../../database/db";
import {
  calculateProfit,
  type InventoryItem,
} from "../../services/inventory/index";

export default defineEventHandler((event) => {
  const db = getDb();
  const query = getQuery(event);
  let sql = "SELECT * FROM inventory WHERE 1=1";
  const params: unknown[] = [];

  if (query.status) {
    sql += " AND status = ?";
    params.push(query.status);
  }
  if (query.platform) {
    sql += " AND (buy_platform = ? OR sell_platform = ?)";
    params.push(query.platform, query.platform);
  }
  if (query.from) {
    sql += " AND buy_date >= ?";
    params.push(query.from);
  }
  if (query.to) {
    sql += " AND buy_date <= ?";
    params.push(query.to);
  }
  sql += " ORDER BY created_at DESC";

  const rows = db.prepare(sql).all(...params) as InventoryItem[];
  return rows.map((row) => ({
    ...row,
    profit: calculateProfit(row),
  }));
});
