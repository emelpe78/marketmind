import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import savedFlipAnalysesGet from "../../server/api/saved-flip-analyses/index.get";
import savedFlipAnalysesPost from "../../server/api/saved-flip-analyses/index.post";
import savedFlipAnalysisGet from "../../server/api/saved-flip-analyses/[id].get";
import { createEvent } from "h3";

async function callSavedFlipAnalysesPost(body: Record<string, unknown>) {
  vi.stubGlobal("readBody", async () => body);
  const event = createEvent({
    method: "POST",
    url: "/api/saved-flip-analyses",
  });
  return (savedFlipAnalysesPost as (event: typeof event) => Promise<unknown>)(
    event,
  );
}

describe("saved flip analyses API", () => {
  it("creates and lists saved flip analyses", async () => {
    createTestDb();

    const created = (await callSavedFlipAnalysesPost({
      listingUrl: "https://www.kleinanzeigen.de/s-anzeige/test/1",
      listingPlatform: "kleinanzeigen",
      query: "RTX 3060 12GB",
      analysis: "### Fazit\nKaufen ✅",
      listing: {
        platform: "kleinanzeigen",
        url: "https://www.kleinanzeigen.de/s-anzeige/test/1",
        title: "RTX 3060 12GB",
        price: 180,
        condition: "Gut",
        location: "Berlin",
        description: null,
        category: null,
      },
      marketStats: {
        min: 100,
        max: 300,
        avg: 200,
        median: 190,
        count: 5,
        histogram: [],
        conditionBreakdown: {},
        platformComparison: {},
        demandIndicator: 2,
      },
      marketSamples: [],
    })) as { id: number; title: string };

    expect(created.id).toBeGreaterThan(0);
    expect(created.title).toBe("RTX 3060 12GB");

    const list = (savedFlipAnalysesGet as () => unknown)() as Array<{
      id: number;
    }>;
    expect(list).toHaveLength(1);

    vi.stubGlobal("getRouterParam", () => String(created.id));
    const detail = (savedFlipAnalysisGet as (event: unknown) => unknown)(
      createEvent({
        method: "GET",
        url: `/api/saved-flip-analyses/${created.id}`,
      }),
    ) as { analysis: string };
    expect(detail.analysis).toContain("Fazit");
  });
});
