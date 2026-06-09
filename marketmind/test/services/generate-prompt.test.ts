import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { generateAgentPrompt } from "../../server/services/agents/generate-prompt";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn().mockResolvedValue({
    content: "Du bist ein hilfreicher Agent.",
    tokensUsed: 30,
    costUsd: 0.0005,
    model: "test",
  }),
}));

describe("generateAgentPrompt", () => {
  it("returns prompt from strategy agent", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const result = await generateAgentPrompt(db, "Flipping-Berater für GPUs");

    expect(result.prompt).toContain("hilfreicher Agent");
  });
});
