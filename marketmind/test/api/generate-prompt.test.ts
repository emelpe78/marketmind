import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "../../server/database/db";
import { setSetting } from "../../server/database/settings";
import generatePromptHandler from "../../server/api/agents/generate-prompt.post";
import { createEvent } from "h3";

vi.mock("../../server/services/openrouter/client", () => ({
  chatCompletion: vi.fn(),
}));

import { chatCompletion } from "../../server/services/openrouter/client";

const mockChatCompletion = vi.mocked(chatCompletion);

describe("generate-prompt API", () => {
  beforeEach(() => {
    mockChatCompletion.mockReset();
  });

  it("logs agent history when generating a prompt", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");
    mockChatCompletion.mockResolvedValue({
      content: "Du bist ein hilfreicher Agent.",
      tokensUsed: 30,
      costUsd: 0.0005,
      model: "test",
    });

    vi.stubGlobal("readBody", async () => ({
      description: "Flipping-Berater für GPUs",
    }));
    const event = createEvent({
      method: "POST",
      url: "/api/agents/generate-prompt",
    });
    const result = (await (
      generatePromptHandler as (event: typeof event) => Promise<unknown>
    )(event)) as { prompt: string };

    expect(result.prompt).toContain("hilfreicher Agent");
    const history = db.prepare("SELECT * FROM agent_history").all();
    expect(history).toHaveLength(1);
  });
});
