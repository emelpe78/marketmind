import type Database from "better-sqlite3";
import { getAiConfig, isAiConfigured } from "../ai/config";
import { listAgentsWithStats } from "../agents/repository";
import { getInventorySummary } from "../inventory/index";
import { findActiveWatchlistItems } from "../watchlist/repository";
import { checkAlert } from "../watchlist/alerts";

function countRows(
  db: Database.Database,
  sql: string,
  ...params: unknown[]
): number {
  const row = db.prepare(sql).get(...params) as { count: number };
  return row.count;
}

export function getDashboardSummary(db: Database.Database) {
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
    savedResearchCount: countRows(
      db,
      "SELECT COUNT(*) as count FROM saved_researches",
    ),
    savedFlipAnalysisCount: countRows(
      db,
      "SELECT COUNT(*) as count FROM saved_flip_analyses",
    ),
    savedListingCount: countRows(db, "SELECT COUNT(*) as count FROM listings"),
    watchlistItemCount: watchlistItems.length,
    watchlistAlerts,
    openInventoryCount: countRows(
      db,
      "SELECT COUNT(*) as count FROM inventory WHERE status = 'gekauft'",
    ),
    agentCallCount: countRows(
      db,
      "SELECT COUNT(*) as count FROM agent_history",
    ),
    promptLibraryCount: countRows(
      db,
      "SELECT COUNT(*) as count FROM prompt_library",
    ),
    agents: listAgentsWithStats(db).map((agent) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type,
      callCount: agent.call_count,
      totalCostUsd: agent.total_cost_usd,
    })),
    inventorySummary,
    tokenCosts: tokenRow.total,
    aiConfigured: isAiConfigured(aiConfig),
    aiProvider: aiConfig.provider,
  };
}
