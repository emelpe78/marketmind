import type Database from "better-sqlite3";
import { getAiConfig, isAiConfigured } from "../ai/config";
import { countAgentHistory, listAgentsWithStats } from "../agents/repository";
import { countSavedFlipAnalyses } from "../flipping/saved-flip-analysis";
import { getInventorySummary } from "../inventory/index";
import { countListings } from "../listings/repository";
import { countPrompts } from "../prompt-library/repository";
import { countSavedResearches } from "../research/saved-research";
import {
  countActiveWatchlistAlerts,
  countActiveWatchlistItems,
} from "../watchlist/repository";
import { countOpenInventory } from "../inventory/repository";

export function getDashboardSummary(db: Database.Database) {
  const inventorySummary = getInventorySummary(db);

  const tokenRow = db
    .prepare("SELECT COALESCE(SUM(cost_usd), 0) as total FROM agent_history")
    .get() as { total: number };

  const aiConfig = getAiConfig(db);

  return {
    savedResearchCount: countSavedResearches(db),
    savedFlipAnalysisCount: countSavedFlipAnalyses(db),
    savedListingCount: countListings(db),
    watchlistItemCount: countActiveWatchlistItems(db),
    watchlistAlerts: countActiveWatchlistAlerts(db),
    openInventoryCount: countOpenInventory(db),
    agentCallCount: countAgentHistory(db),
    promptLibraryCount: countPrompts(db),
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
