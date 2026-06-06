import { getDb } from "../database/db";
import { getInventorySummary } from "../services/inventory/index";
import { checkAlert } from "../services/watchlist/scraper";

export default defineEventHandler(() => {
  const db = getDb();

  const recentSearches = db
    .prepare("SELECT * FROM searches ORDER BY timestamp DESC LIMIT 5")
    .all();

  const watchlistItems = db
    .prepare("SELECT * FROM watchlist WHERE status = 'aktiv'")
    .all() as {
    current_price: number | null;
    target_price: number | null;
    alert_active: number;
  }[];

  const watchlistAlerts = watchlistItems.filter((item) =>
    checkAlert(item.current_price, item.target_price, item.alert_active),
  ).length;

  const inventorySummary = getInventorySummary(db);

  const tokenRow = db
    .prepare("SELECT COALESCE(SUM(cost_usd), 0) as total FROM agent_history")
    .get() as { total: number };

  return {
    recentSearches,
    watchlistAlerts,
    inventorySummary,
    tokenCosts: tokenRow.total,
  };
});
