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
    ).rejects.toThrow("OpenRouter API-Key nicht konfiguriert");
  });

  it("prefers assigned library prompt over agents.system_prompt", async () => {
    const db = getDb();
    setSetting(db, "openrouter-api-key", "sk-test");

    const agent = db
      .prepare("SELECT id FROM agents WHERE type = 'research'")
      .get() as { id: number };
    db.prepare("UPDATE agents SET system_prompt = ? WHERE id = ?").run(
      "Alter Agent-Prompt",
      agent.id,
    );
    db.prepare(
      "INSERT INTO prompt_library (name, prompt, agent_id) VALUES (?, ?, ?)",
    ).run("Bibliothek", "Bibliotheks-Prompt", agent.id);

    await runAgent(db, {
      agentType: "research",
      userInput: "Test",
      mode: "required",
    });

    const call = mockChatCompletion.mock.calls[0];
    expect(call?.[2]?.[0]?.content).toBe("Bibliotheks-Prompt");
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
    const history = db.prepare("SELECT * FROM agent_history").all() as Array<{
      cost_usd: number;
      provider: string;
    }>;
    expect(history).toHaveLength(1);
    expect(history[0]?.cost_usd).toBe(0.001);
    expect(history[0]?.provider).toBe("openrouter");
  });

  it("logs zero cost and local provider when local AI is active", async () => {
    const db = getDb();
    setSetting(db, "ai-provider", "local");
    setSetting(db, "local-ai-model", "llama3");
    setSetting(db, "local-ai-api-url", "http://127.0.0.1:11434/v1");
    mockChatCompletion.mockResolvedValue({
      content: "Lokale Antwort",
      tokensUsed: 500,
      costUsd: 0.0005,
      model: "llama3",
    });

    const result = await runAgent(db, {
      agentType: "research",
      userInput: "Analysiere Preise",
      mode: "required",
    });

    expect(result.costUsd).toBe(0);
    const history = db.prepare("SELECT * FROM agent_history").all() as Array<{
      cost_usd: number;
      provider: string;
    }>;
    expect(history).toHaveLength(1);
    expect(history[0]?.cost_usd).toBe(0);
    expect(history[0]?.provider).toBe("local");
  });
});
