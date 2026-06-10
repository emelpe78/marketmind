import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import scrapeItem from "../../server/api/watchlist/[id]/scrape.post";
import scrapeAll from "../../server/api/watchlist/scrape-all.post";
import { createEvent } from "h3";

async function callScrapeItem(id: number) {
  vi.stubGlobal("readBody", async () => ({}));
  vi.stubGlobal("getRouterParam", () => String(id));
  const event = createEvent({
    method: "POST",
    url: `/api/watchlist/${id}/scrape`,
  });
  return (scrapeItem as (event: typeof event) => Promise<unknown>)(event);
}

describe("watchlist scrape API", () => {
  it("scrapes a single watchlist item via repository", async () => {
    createTestDb();
    const db = getDb();
    const insert = db
      .prepare(
        `INSERT INTO watchlist (title, url, platform, target_price, alert_active, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run("GPU", "https://ebay.de/item/1", "ebay", 200, 1, "aktiv");
    const id = Number(insert.lastInsertRowid);

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<html><head><meta property="og:title" content="GPU" /></head><body><div class="x-price-primary">150,00 €</div></body></html>`,
      headers: { getSetCookie: () => [] },
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = (await callScrapeItem(id)) as {
      current_price: number;
      alertTriggered: boolean;
    };

    expect(result.current_price).toBe(150);
    expect(result.alertTriggered).toBe(true);
  });

  it("scrapes all active watchlist items", async () => {
    createTestDb();
    const db = getDb();
    db.prepare(
      `INSERT INTO watchlist (title, url, platform, target_price, alert_active, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run("Item A", "https://ebay.de/a", "ebay", 100, 1, "aktiv");

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        `<html><head><meta property="og:title" content="Item A" /></head><body><div class="x-price-primary">90,00 €</div></body></html>`,
      headers: { getSetCookie: () => [] },
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = (await scrapeAll()) as {
      updated: number;
      results: unknown[];
    };

    expect(result.updated).toBe(1);
    expect(result.results).toHaveLength(1);
  });
});
