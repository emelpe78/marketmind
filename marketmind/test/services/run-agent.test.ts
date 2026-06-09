import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import { runAgent } from "../../server/services/ai/run-agent";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("runAgent", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
    mockChatCompletion.mockResolvedValue({
      content: "Antwort",
      tokensUsed: 42,
      costUsd: 0.001,
      model: "test",
    });
  });

  it("skips when mode is optional and AI is not configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "");

    const result = await runAgent(db, {
      agentType: "analytics",
      userInput: "Test",
      mode: "optional",
    });

    expect(result.skipped).toBe(true);
    expect(mockChatCompletion).not.toHaveBeenCalled();
  });

  it("throws when mode is required and AI is not configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "");

    await expect(
      runAgent(db, {
        agentType: "analytics",
        userInput: "Test",
        mode: "required",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it("logs history by default when AI is configured", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const result = await runAgent(db, {
      agentType: "research",
      userInput: "Analysiere Preise",
      mode: "required",
    });

    expect(result.skipped).toBe(false);
    expect(result.content).toBe("Antwort");
    const history = db.prepare("SELECT * FROM agent_history").all();
    expect(history).toHaveLength(1);
  });
});
