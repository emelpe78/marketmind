import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import { normalizePlatform } from "shared/detect-platform";
import {
  calculateProfit,
  getInventorySummary,
} from "../../server/services/inventory/index";
import { checkAlert } from "../../server/services/watchlist/alerts";
import { scrapeListingPrice } from "../../server/services/scraper/price-extract";
import { scrapeWatchlistItem } from "../../server/services/watchlist/scraper";

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

  it("normalizes platform values from select objects", () => {
    expect(normalizePlatform({ value: "ebay" })).toBe("ebay");
    expect(normalizePlatform("kleinanzeigen")).toBe("kleinanzeigen");
  });

  it("coerces sqlite string prices when calculating profit", () => {
    const profit = calculateProfit({
      title: "GPU",
      buy_price: "100" as unknown as number,
      sell_price: "180" as unknown as number,
      status: "verkauft",
      buy_platform: null,
      buy_date: null,
      sell_platform: null,
      sell_date: null,
      profit: null,
      notes: null,
    });
    expect(profit).toBe(80);
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

describe("watchlist scraper", () => {
  it("parses eBay price from listing HTML", () => {
    const html = `<div class="x-price-primary">125,00 €</div>`;
    expect(scrapeListingPrice(html)).toBe(125);
  });

  it("parses Kleinanzeigen price from listing HTML", () => {
    const html = `<div class="boxedarticle--price">300 € VB</div>`;
    expect(scrapeListingPrice(html)).toBe(300);
  });

  it("scrapes watchlist item and triggers alert when price below target", async () => {
    createTestDb();
    const db = getDb();
    const insert = db
      .prepare(
        `INSERT INTO watchlist (title, url, platform, target_price, alert_active, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run("Test GPU", "https://ebay.de/item/123", "ebay", 150, 1, "aktiv");
    const item = db
      .prepare("SELECT * FROM watchlist WHERE id = ?")
      .get(insert.lastInsertRowid) as {
      id: number;
      title: string;
      url: string;
      platform: string;
      target_price: number;
      current_price: number | null;
      alert_active: number;
      status: string;
    };

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<html><head><meta property="og:title" content="Test GPU" /></head><body><div class="x-price-primary">120,00 €</div></body></html>`,
      headers: { getSetCookie: () => [] },
    });

    const result = await scrapeWatchlistItem(
      db,
      item,
      mockFetch as typeof fetch,
    );

    expect(result.price).toBe(120);
    expect(result.alertTriggered).toBe(true);

    const updated = db
      .prepare("SELECT current_price FROM watchlist WHERE id = ?")
      .get(item.id) as { current_price: number };
    expect(updated.current_price).toBe(120);
  });
});
