import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import listingsGenerate from "../../server/api/listings/generate.post";
import { createEvent } from "h3";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

async function callListingsGenerate(body: Record<string, unknown>) {
  vi.stubGlobal("readBody", async () => body);
  const event = createEvent({
    method: "POST",
    url: "/api/listings/generate",
  });
  return (listingsGenerate as (event: typeof event) => Promise<unknown>)(event);
}

describe("listings generate API", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
  });

  it("throws when AI is not configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "");

    await expect(
      callListingsGenerate({
        query: "GTX 1080 Ti",
        platform: "kleinanzeigen",
        condition: "gut",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("generates listing and logs agent history when AI is configured", async () => {
    const db = getDb();
    setSetting(db, "ai-provider", "openrouter");
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: JSON.stringify({
        title: "GTX 1080 Ti verkaufen",
        description: "Sehr guter Zustand.",
        priceSuggestion: 200,
        category: "PC",
      }),
      tokensUsed: 120,
      costUsd: 0.002,
      model: "test-model",
    });

    const result = (await callListingsGenerate({
      query: "GTX 1080 Ti",
      platform: "kleinanzeigen",
      condition: "gut",
    })) as { title: string; platform: string };

    expect(result.title).toContain("GTX 1080 Ti");
    expect(result.platform).toBe("kleinanzeigen");
    expect(mockChatCompletion).toHaveBeenCalledOnce();

    const history = db.prepare("SELECT * FROM agent_history").all();
    expect(history).toHaveLength(1);
  });
});
