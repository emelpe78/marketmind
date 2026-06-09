import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { generateListing } from "../../server/services/listings/generate-listing";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: JSON.stringify({
      title: "GTX 1080 Ti",
      description: "Guter Zustand.",
      priceSuggestion: 200,
      category: "PC",
    }),
    tokensUsed: 50,
    costUsd: 0.001,
    model: "test",
  }),
}));

describe("generateListing", () => {
  it("parses listing from agent response", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const result = await generateListing(db, {
      query: "GTX 1080 Ti",
      platform: "kleinanzeigen",
      condition: "gut",
    });

    expect(result.platform).toBe("kleinanzeigen");
    expect(result.title).toBe("GTX 1080 Ti");
    expect(result.priceSuggestion).toBe(200);
  });
});
