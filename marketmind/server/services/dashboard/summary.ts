import type Database from "better-sqlite3";
import { getAiConfig, isAiConfigured } from "../ai/config";
import { getInventorySummary } from "../inventory/index";
import { listSavedResearches } from "../research/saved-research";
import { findRecentSearches } from "../searches/repository";
import { findActiveWatchlistItems } from "../watchlist/repository";
import { checkAlert } from "../watchlist/scraper";

export function getDashboardSummary(db: Database.Database) {
  const recentSearches = findRecentSearches(db, 5);
  const savedResearches = listSavedResearches(db);
  const watchlistItems = findActiveWatchlistItems(db);

  const watchlistAlerts = watchlistItems.filter((item) =>
    checkAlert(item.current_price, item.target_price, item.alert_active),
  ).length;

  const inventorySummary = getInventorySummary(db);

  const tokenRow = db
    .prepare("SELECT COALESCE(SUM(cost_usd), 0) as total FROM agent_history")
    .get() as { total: number };

  const aiConfig = getAiConfig(db);

  return {
    recentSearches,
    savedResearches,
    watchlistAlerts,
    inventorySummary,
    tokenCosts: tokenRow.total,
    aiConfigured: isAiConfigured(aiConfig),
    aiProvider: aiConfig.provider,
  };
}
