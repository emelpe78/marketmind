import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { analyzeFlip } from "../../server/services/flipping/analyze-flip";
import {
  InvalidFlipInputError,
  UnsupportedListingUrlError,
} from "../../server/services/errors";
import { ScraperFetchError } from "../../server/services/scraper/fetcher";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);
const fixturesDir = join(__dirname, "../fixtures");

const emptyEbaySearchHtml =
  '<html><body><ul class="srp-results"></ul></body></html>';
const emptyKaSearchHtml =
  '<html><body><ul id="srchrslt-adtable"></ul></body></html>';

function isFollowUpSearchPage(url: string): boolean {
  const normalized = String(url);
  return normalized.includes("_pgn=2") || normalized.includes("s-seite:2");
}

function testScraperDeps(fetchImpl: (url: string) => Promise<Response>) {
  return {
    fetchFn: vi.fn(fetchImpl) as typeof fetch,
    sleepFn: async () => {},
    randomFn: () => 0,
    skipWarmUp: true,
  };
}

describe("analyzeFlip", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
  });

  it("throws on empty url", async () => {
    const db = getDb();
    await expect(analyzeFlip(db, { url: "  " })).rejects.toThrow(
      InvalidFlipInputError,
    );
  });

  it("throws on unsupported URL", async () => {
    const db = getDb();
    await expect(
      analyzeFlip(db, { url: "https://example.com/item" }),
    ).rejects.toThrow(UnsupportedListingUrlError);
  });

  it("throws on product name instead of URL", async () => {
    const db = getDb();
    await expect(analyzeFlip(db, { url: "RTX 3060 12GB" })).rejects.toThrow(
      UnsupportedListingUrlError,
    );
  });

  it("scrapes listing URL and includes listing in analysis", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: "### 7. Gesamtempfehlung\nKaufen ✅",
      tokensUsed: 90,
      costUsd: 0.001,
      model: "test",
    });

    const listingHtml = readFileSync(
      join(fixturesDir, "kleinanzeigen/listing-detail.html"),
      "utf-8",
    );
    const kaSearchHtml = readFileSync(
      join(fixturesDir, "kleinanzeigen/page1.html"),
      "utf-8",
    );
    const ebayHtml = readFileSync(
      join(fixturesDir, "ebay/s-card-page.html"),
      "utf-8",
    );

    const listingUrl = "https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123";

    const result = await analyzeFlip(db, {
      url: listingUrl,
      scraperDeps: testScraperDeps(async (url: string) => {
        if (String(url) === listingUrl) {
          return new Response(listingHtml, { status: 200 });
        }
        if (isFollowUpSearchPage(url)) {
          return new Response(
            String(url).includes("ebay")
              ? emptyEbaySearchHtml
              : emptyKaSearchHtml,
            { status: 200 },
          );
        }
        if (String(url).includes("ebay")) {
          return new Response(ebayHtml, { status: 200 });
        }
        return new Response(kaSearchHtml, { status: 200 });
      }),
    });

    expect(result.listing.title).toBe("RTX 3060 12GB zu verkaufen");
    expect(result.listing.price).toBe(180);
    expect(result.query).toBe("RTX 3060 12GB");
    expect(result.analysis).toContain("Gesamtempfehlung");
    expect(result.marketStats.count).toBeGreaterThan(0);
    expect(mockChatCompletion).toHaveBeenCalledOnce();
  });

  it("continues analysis when market search fails", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: "### 7. Gesamtempfehlung\nAbwarten ⏳",
      tokensUsed: 90,
      costUsd: 0.001,
      model: "test",
    });

    const listingHtml = readFileSync(
      join(fixturesDir, "kleinanzeigen/listing-detail.html"),
      "utf-8",
    );

    const listingUrl = "https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123";
    let searchCalls = 0;

    const result = await analyzeFlip(db, {
      url: listingUrl,
      scraperDeps: testScraperDeps(async (url: string) => {
        if (String(url) === listingUrl) {
          return new Response(listingHtml, { status: 200 });
        }
        searchCalls++;
        throw new ScraperFetchError(
          "Kleinanzeigen.de antwortet mit HTTP 400.",
          400,
          String(url),
          "kleinanzeigen",
        );
      }),
    });

    expect(searchCalls).toBeGreaterThan(0);
    expect(result.marketStats.count).toBe(0);
    expect(result.analysis).toContain("Gesamtempfehlung");
    expect(mockChatCompletion).toHaveBeenCalledOnce();

    const call = mockChatCompletion.mock.calls[0];
    const userMessage = call?.[2]?.[1]?.content as string;
    expect(userMessage).toContain("Keine Vergleichsangebote verfügbar");
  });
});
