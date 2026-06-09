import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import flippingAnalyze from "../../server/api/flipping/analyze.post";
import { createEvent } from "h3";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);
const fixturesDir = join(__dirname, "../fixtures");

async function callFlippingAnalyze(body: Record<string, unknown>) {
  vi.stubGlobal("readBody", async () => body);
  const event = createEvent({
    method: "POST",
    url: "/api/flipping/analyze",
  });
  return (flippingAnalyze as (event: typeof event) => Promise<unknown>)(event);
}

describe("flipping analyze API", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
  });

  it("returns 400 when url is missing", async () => {
    await expect(callFlippingAnalyze({ url: "" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("returns analysis for listing URL when AI is configured", async () => {
    const db = getDb();
    setSetting(db, "ai-provider", "openrouter");
    setSetting(db, "openrouter-api-key", "sk-test");
    setSetting(db, "scraper-delay-min", "0");
    setSetting(db, "scraper-delay-max", "0");
    mockChatCompletion.mockResolvedValue({
      content: "### 1. Kalkulations-Zusammenfassung\nSolide Marge.",
      tokensUsed: 80,
      costUsd: 0.001,
      model: "test-model",
    });

    const listingHtml = readFileSync(
      join(fixturesDir, "kleinanzeigen/listing-detail.html"),
      "utf-8",
    );
    const ebayHtml = readFileSync(
      join(fixturesDir, "ebay/s-card-page.html"),
      "utf-8",
    );
    const kaHtml = readFileSync(
      join(fixturesDir, "kleinanzeigen/page1.html"),
      "utf-8",
    );

    const listingUrl = "https://www.kleinanzeigen.de/s-anzeige/rtx-3060/123";
    const emptyEbaySearchHtml =
      '<html><body><ul class="srp-results"></ul></body></html>';
    const emptyKaSearchHtml =
      '<html><body><ul id="srchrslt-adtable"></ul></body></html>';

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        const normalized = String(url);
        if (normalized === listingUrl) {
          return new Response(listingHtml, { status: 200 });
        }
        if (normalized.includes("_pgn=2") || normalized.includes("s-seite:2")) {
          return new Response(
            normalized.includes("ebay")
              ? emptyEbaySearchHtml
              : emptyKaSearchHtml,
            { status: 200 },
          );
        }
        if (normalized.includes("ebay")) {
          return new Response(ebayHtml, { status: 200 });
        }
        return new Response(kaHtml, { status: 200 });
      }) as typeof fetch,
    );

    const result = (await callFlippingAnalyze({
      url: listingUrl,
    })) as { analysis: string; query: string; listing: { title: string } };

    expect(result.listing.title).toBe("RTX 3060 12GB zu verkaufen");
    expect(result.query).toBe("RTX 3060 12GB");
    expect(result.analysis).toContain("Kalkulations-Zusammenfassung");
    expect(mockChatCompletion).toHaveBeenCalledOnce();

    const history = db.prepare("SELECT * FROM agent_history").all() as {
      user_input: string;
    }[];
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.user_input).toContain("RTX 3060 12GB");
  });
});
