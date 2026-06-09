import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import {
  PROMPT_GENERATOR_SYSTEM_PROMPT,
  PROMPT_GENERATOR_TEMPERATURE,
} from "../../shared/agent-meta";
import { generateAgentPrompt } from "../../server/services/agents/generate-prompt";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: "Du bist ein hilfreicher Agent.",
    tokensUsed: 30,
    costUsd: 0.0005,
    model: "test",
  }),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("generateAgentPrompt", () => {
  beforeEach(() => {
    mockChatCompletion.mockClear();
  });

  it("returns prompt from strategy agent", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const result = await generateAgentPrompt(db, "Flipping-Berater für GPUs");

    expect(result.prompt).toContain("hilfreicher Agent");
  });

  it("uses meta prompt and fixed temperature", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    await generateAgentPrompt(db, "Listing-Agent für Vintage-Kameras");

    expect(mockChatCompletion).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.arrayContaining([
        { role: "system", content: PROMPT_GENERATOR_SYSTEM_PROMPT },
        {
          role: "user",
          content: expect.stringContaining("Vintage-Kameras"),
        },
      ]),
      PROMPT_GENERATOR_TEMPERATURE,
      undefined,
    );
  });
});
