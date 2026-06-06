import { getDb } from "../../database/db";
import { calculateProfit } from "../../services/inventory/index";

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

  return db.prepare(sql).all(...params);
});
