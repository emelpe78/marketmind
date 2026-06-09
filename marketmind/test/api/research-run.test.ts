import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import researchRun from "../../server/api/research/run.post";
import { createEvent } from "h3";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: "Markt stabil.",
    tokensUsed: 50,
    costUsd: 0.001,
    model: "test",
  }),
}));

async function callResearchRun(body: Record<string, unknown>) {
  vi.stubGlobal("readBody", async () => body);
  const event = createEvent({
    method: "POST",
    url: "/api/research/run",
  });
  return (researchRun as (event: typeof event) => Promise<unknown>)(event);
}

describe("research run API", () => {
  it("analyzes an existing search by searchId", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    const search = db
      .prepare("INSERT INTO searches (query, platform) VALUES (?, ?)")
      .run("RTX 3060", "ebay");
    const searchId = Number(search.lastInsertRowid);
    db.prepare(
      "INSERT INTO search_results (search_id, title, price, platform, url) VALUES (?, ?, ?, ?, ?)",
    ).run(searchId, "MSI RTX 3060", 250, "ebay", "https://ebay.de/1");

    const result = (await callResearchRun({ searchId, analyze: true })) as {
      searchId: number;
      stats: { count: number };
      summaries: Array<{ summary: string }>;
    };

    expect(result.searchId).toBe(searchId);
    expect(result.stats.count).toBe(1);
    expect(result.summaries).toHaveLength(1);
    expect(result.summaries[0]?.summary).toContain("Markt stabil");
  });

  it("rejects missing query when searchId is absent", async () => {
    await expect(callResearchRun({ platform: "ebay" })).rejects.toMatchObject({
      statusCode: 400,
      message: "Suchbegriff fehlt",
    });
  });
});
