import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  calculateProfit,
  getInventorySummary,
} from "../../server/services/inventory/index";
import { checkAlert } from "../../server/services/watchlist/scraper";

describe("inventory", () => {
  it("auto-calculates profit when sold", () => {
    const profit = calculateProfit({
      title: "GPU",
      buy_price: 100,
      sell_price: 150,
      status: "verkauft",
      buy_platform: null,
      buy_date: null,
      sell_platform: null,
      sell_date: null,
      profit: null,
      notes: null,
    });
    expect(profit).toBe(50);
  });

  it("computes inventory summary", () => {
    createTestDb();
    const db = getDb();
    db.prepare(
      `INSERT INTO inventory (title, buy_price, sell_price, status, profit) VALUES (?, ?, ?, ?, ?)`,
    ).run("Flip A", 100, 200, "verkauft", 100);
    db.prepare(
      `INSERT INTO inventory (title, buy_price, sell_price, status, profit) VALUES (?, ?, ?, ?, ?)`,
    ).run("Flip B", 50, 40, "verkauft", -10);

    const summary = getInventorySummary(db);
    expect(summary.totalProfit).toBe(90);
    expect(summary.bestFlip?.title).toBe("Flip A");
    expect(summary.worstFlip?.title).toBe("Flip B");
  });
});

describe("watchlist alerts", () => {
  it("triggers alert when price at or below target", () => {
    expect(checkAlert(80, 100, 1)).toBe(true);
    expect(checkAlert(100, 100, 1)).toBe(true);
    expect(checkAlert(120, 100, 1)).toBe(false);
    expect(checkAlert(80, 100, 0)).toBe(false);
  });
});
