import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { analyzeFlip } from "../../server/services/flipping/analyze-flip";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("analyzeFlip", () => {
  it("returns calculation without recommendation when AI is skipped", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "");

    const result = await analyzeFlip(db, {
      buyPrice: 100,
      sellPrice: 150,
      shipping: 5,
      packaging: 2,
    });

    expect(result.profit).toBe(43);
    expect(result.recommendation).toBe("");
    expect(mockChatCompletion).not.toHaveBeenCalled();
  });

  it("includes AI recommendation when configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: "Gute Marge.",
      tokensUsed: 20,
      costUsd: 0.0001,
      model: "test",
    });

    const result = await analyzeFlip(db, {
      buyPrice: 100,
      sellPrice: 200,
      shipping: 10,
      packaging: 5,
      productName: "GPU",
    });

    expect(result.recommendation).toBe("Gute Marge.");
    expect(result.score).toBe("Sehr lohnenswert");
  });
});
