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

  it("returns calculation without recommendation when AI is not configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "");

    const result = (await callFlippingAnalyze({
      buyPrice: 100,
      sellPrice: 150,
      shipping: 5,
      packaging: 2,
      productName: "GPU",
    })) as { profit: number; recommendation: string };

    expect(result.profit).toBe(43);
    expect(result.recommendation).toBe("");
    expect(mockChatCompletion).not.toHaveBeenCalled();
  });

  it("returns calculation with AI recommendation when configured", async () => {
    const db = getDb();
    setSetting(db, "ai-provider", "openrouter");
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: "Gute Marge für privaten Verkauf.",
      tokensUsed: 80,
      costUsd: 0.001,
      model: "test-model",
    });

    const result = (await callFlippingAnalyze({
      buyPrice: 100,
      sellPrice: 150,
      shipping: 5,
      packaging: 2,
      productName: "GPU",
    })) as { profit: number; recommendation: string };

    expect(result.profit).toBe(43);
    expect(result.recommendation).toContain("Gute Marge");
    expect(mockChatCompletion).toHaveBeenCalledOnce();

    const history = db.prepare("SELECT * FROM agent_history").all() as {
      user_input: string;
    }[];
    expect(history).toHaveLength(1);
    expect(history[0]?.user_input).toContain("GPU");
  });
});
