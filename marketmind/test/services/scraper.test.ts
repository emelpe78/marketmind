import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi } from "vitest";
import {
  buildEbaySearchUrl,
  parseEbayHtml,
} from "../../server/services/scraper/ebay";
import {
  buildKleinanzeigenSearchUrl,
  parseKleinanzeigenHtml,
  parseKleinanzeigenPrice,
} from "../../server/services/scraper/kleinanzeigen";
import {
  fetchWithConfig,
  getNextUserAgent,
  getCachedHtml,
  buildRequestHeaders,
  ScraperFetchError,
  USER_AGENTS,
} from "../../server/services/scraper/fetcher";
import { createTestDb } from "../helpers/test-db";
import { getDb, initDatabase } from "../../server/database/db";
import { createScraperRuntime } from "../../server/services/scraper/runtime";
import { analyzePrices } from "../../server/services/stats/price-analysis";

const fixturesDir = join(__dirname, "../fixtures");

describe("eBay scraper", () => {
  it("builds URL with required DE sold parameters", () => {
    const url = buildEbaySearchUrl("rtx 3060 12gb");
    expect(url).toContain("LH_PrefLoc=1");
    expect(url).toContain("LH_Sold=1");
    expect(url).toContain("LH_Complete=1");
    expect(url).toContain("_nkw=rtx+3060+12gb");
  });

  it("parses modern s-card layout", () => {
    const html = readFileSync(
      join(fixturesDir, "ebay/s-card-page.html"),
      "utf-8",
    );
    const items = parseEbayHtml(html);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: expect.stringContaining("MSI RTX 3060"),
      price: 125,
      platform: "ebay",
    });
  });

  it("parses legacy fixture into sold listings", () => {
    const html = readFileSync(join(fixturesDir, "ebay/page1.html"), "utf-8");
    const items = parseEbayHtml(html);

    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      title: expect.stringContaining("RTX 3060"),
      price: 189,
      condition: "Gebraucht",
      sold: true,
      platform: "ebay",
    });
  });

  it("aggregates paginated results", async () => {
    createTestDb();
    const db = getDb();
    const page1 = readFileSync(join(fixturesDir, "ebay/page1.html"), "utf-8");
    const page2 = readFileSync(join(fixturesDir, "ebay/page2.html"), "utf-8");
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      const html =
        callCount === 1
          ? page1
          : callCount === 2
            ? page2
            : '<html><ul class="srp-results"></ul></html>';
      return Promise.resolve({ ok: true, text: async () => html });
    });

    const { results } = await createScraperRuntime(db, {
      fetchFn: mockFetch as typeof fetch,
      sleepFn: async () => {},
      randomFn: () => 0,
      skipWarmUp: true,
    }).runSearch("rtx 3060", "ebay");

    expect(results.length).toBe(4);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});

describe("Kleinanzeigen scraper", () => {
  it("parses price with euro suffix and VB", () => {
    expect(parseKleinanzeigenPrice("300 € VB")).toBe(300);
    expect(parseKleinanzeigenPrice("250 €")).toBe(250);
    expect(parseKleinanzeigenPrice("VB")).toBe(0);
  });

  it("parses fixture into active listings", () => {
    const html = readFileSync(
      join(fixturesDir, "kleinanzeigen/page1.html"),
      "utf-8",
    );
    const items = parseKleinanzeigenHtml(html);

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: expect.stringContaining("RTX 3060"),
      price: 180,
      location: "Berlin",
      platform: "kleinanzeigen",
    });
  });

  it("builds search URL without duplicate keywords param", () => {
    const url = buildKleinanzeigenSearchUrl("rtx 3060 12gb");
    expect(url).toBe("https://www.kleinanzeigen.de/s-rtx-3060-12gb/k0");
    expect(url).not.toContain("keywords=");
  });

  it("builds paginated search URL", () => {
    const url = buildKleinanzeigenSearchUrl("rtx 3060 12gb", 2);
    expect(url).toBe("https://www.kleinanzeigen.de/s-seite:2/rtx-3060-12gb/k0");
  });

  it("sanitizes slashes and special chars in search URL", () => {
    const url = buildKleinanzeigenSearchUrl(
      "Gaming/Office PC i5 GTX 1050 Ti 16GB RAM SSD+SSHD",
    );
    expect(url).toBe(
      "https://www.kleinanzeigen.de/s-gaming-office-pc-i5-gtx-1050-ti-16gb-ram-ssd-sshd/k0",
    );
    expect(url).not.toContain("%2F");
  });
});

describe("fetcher", () => {
  it("rotates user agents", () => {
    const idx = { current: 0 };
    const ua1 = getNextUserAgent(true, idx);
    const ua2 = getNextUserAgent(true, idx);
    expect(ua1).not.toBe(ua2);
  });

  it("builds browser-like headers for ebay search", () => {
    const headers = buildRequestHeaders(
      "https://www.ebay.de/sch/i.html?_nkw=test",
      USER_AGENTS[0],
    );
    expect(headers["Accept-Language"]).toContain("de-DE");
    expect(headers.Referer).toBe("https://www.ebay.de/");
    expect(headers["Sec-Fetch-Site"]).toBe("same-origin");
  });

  it("throws ScraperFetchError on blocked response", async () => {
    createTestDb();
    const db = getDb();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      headers: { getSetCookie: () => [] },
      text: async () => "",
    });

    await expect(
      fetchWithConfig(
        db,
        "https://www.ebay.de/sch/i.html?_nkw=test",
        {
          delayMinMs: 0,
          delayMaxMs: 0,
          userAgentRotation: false,
          cacheTtlHours: 6,
        },
        {
          fetchFn: mockFetch as typeof fetch,
          sleepFn: async () => {},
          skipWarmUp: true,
        },
      ),
    ).rejects.toBeInstanceOf(ScraperFetchError);
  });

  it("uses cache on second identical request", async () => {
    const dbPath = createTestDb();
    const db = initDatabase(dbPath);
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "<html>cached</html>",
    });

    const config = {
      delayMinMs: 0,
      delayMaxMs: 0,
      userAgentRotation: false,
      cacheTtlHours: 6,
    };

    await fetchWithConfig(db, "https://example.com/test", config, {
      fetchFn: mockFetch as typeof fetch,
      sleepFn: async () => {},
      randomFn: () => 0,
      skipWarmUp: true,
    });
    await fetchWithConfig(db, "https://example.com/test", config, {
      fetchFn: mockFetch as typeof fetch,
      sleepFn: async () => {},
      randomFn: () => 0,
      skipWarmUp: true,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(getCachedHtml(db, "https://example.com/test", 6)).toBe(
      "<html>cached</html>",
    );
  });
});

describe("price analysis", () => {
  it("computes min max avg median and histogram", () => {
    const stats = analyzePrices([
      { price: 100, condition: "Gebraucht", platform: "ebay", sold: 1 },
      { price: 200, condition: "Neu", platform: "ebay", sold: 1 },
      {
        price: 150,
        condition: "Gebraucht",
        platform: "kleinanzeigen",
        sold: 0,
      },
      { price: 180, condition: "Gebraucht", platform: "ebay", sold: 1 },
    ]);

    expect(stats.min).toBe(100);
    expect(stats.max).toBe(200);
    expect(stats.avg).toBe(157.5);
    expect(stats.median).toBe(165);
    expect(stats.count).toBe(4);
    expect(stats.histogram.length).toBe(5);
    expect(stats.demandIndicator).toBe(3);
    expect(stats.conditionBreakdown["Gebraucht"].count).toBe(3);
  });
});
