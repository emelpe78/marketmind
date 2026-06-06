import { describe, it, expect, vi } from "vitest";
import {
  fetchModels,
  chatCompletion,
} from "../../server/services/openrouter/client";

describe("openrouter client", () => {
  it("fetchModels returns model list from API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
          { id: "openai/gpt-4o", name: "GPT-4o" },
        ],
      }),
    });

    const models = await fetchModels("test-key", mockFetch as typeof fetch);

    expect(models).toHaveLength(2);
    expect(models[0].id).toBe("google/gemini-2.5-pro");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/models",
      expect.objectContaining({
        headers: { Authorization: "Bearer test-key" },
      }),
    );
  });

  it("chatCompletion returns structured response", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Marktanalyse: Preise stabil." } }],
        usage: { total_tokens: 150 },
        model: "google/gemini-2.5-pro",
      }),
    });

    const result = await chatCompletion(
      "test-key",
      "google/gemini-2.5-pro",
      [{ role: "user", content: "Analysiere RTX 3060 Preise" }],
      0.7,
      mockFetch as typeof fetch,
    );

    expect(result.content).toContain("Marktanalyse");
    expect(result.tokensUsed).toBe(150);
    expect(result.model).toBe("google/gemini-2.5-pro");
  });
});
