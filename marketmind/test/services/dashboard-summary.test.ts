import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import { getDashboardSummary } from "../../server/services/dashboard/summary";

describe("getDashboardSummary", () => {
  it("aggregates watchlist alerts, inventory, and token costs", () => {
    createTestDb();
    const db = getDb();

    db.prepare(
      `INSERT INTO watchlist (title, url, platform, target_price, current_price, alert_active, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run("GPU Deal", "https://ebay.de/1", "ebay", 200, 150, 1, "aktiv");

    db.prepare(
      `INSERT INTO inventory (title, buy_price, sell_price, status, profit)
       VALUES (?, ?, ?, ?, ?)`,
    ).run("Sold Item", 100, 180, "verkauft", 80);

    db.prepare(
      `INSERT INTO inventory (title, buy_price, status)
       VALUES (?, ?, ?)`,
    ).run("Open Item", 50, "gekauft");

    const agent = db
      .prepare("SELECT id FROM agents WHERE type = 'research'")
      .get() as { id: number };
    db.prepare(
      `INSERT INTO agent_history (agent_id, user_input, response, tokens_used, cost_usd)
       VALUES (?, ?, ?, ?, ?)`,
    ).run(agent.id, "input", "output", 100, 0.05);

    const summary = getDashboardSummary(db);

    expect(summary.watchlistAlerts).toBe(1);
    expect(summary.watchlistItemCount).toBe(1);
    expect(summary.inventorySummary.soldCount).toBe(1);
    expect(summary.inventorySummary.totalProfit).toBe(80);
    expect(summary.openInventoryCount).toBe(1);
    expect(summary.tokenCosts).toBeCloseTo(0.05);
    expect(summary.agentCallCount).toBe(1);
    expect(summary.savedResearchCount).toBe(0);
    expect(summary.savedFlipAnalysisCount).toBe(0);
    expect(summary.savedListingCount).toBe(0);
    expect(summary.promptLibraryCount).toBeGreaterThanOrEqual(0);
    expect(summary.agents.length).toBeGreaterThan(0);
    expect(summary.agents.some((agent) => agent.type === "research")).toBe(
      true,
    );
  });
});
