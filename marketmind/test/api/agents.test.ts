import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
  generateSystemPrompt,
} from "../../server/services/openrouter/agents";

describe("agents service", () => {
  it("returns default research agent", () => {
    createTestDb();
    const db = getDb();
    const agent = getAgentByType(db, "research");
    expect(agent.name).toBe("Research Agent");
    expect(agent.type).toBe("research");
  });

  it("falls back to default model when agent has no model", () => {
    createTestDb();
    const db = getDb();
    const agent = getAgentByType(db, "research");
    expect(resolveAgentModel(agent, "google/gemini-2.5-pro")).toBe(
      "google/gemini-2.5-pro",
    );
  });

  it("uses agent model when set", () => {
    createTestDb();
    const db = getDb();
    const agent = getAgentByType(db, "research");
    db.prepare("UPDATE agents SET model = ? WHERE id = ?").run(
      "openai/gpt-4o",
      agent.id,
    );
    const updated = getAgentByType(db, "research");
    expect(resolveAgentModel(updated, "google/gemini-2.5-pro")).toBe(
      "openai/gpt-4o",
    );
  });

  it("logs agent history", () => {
    createTestDb();
    const db = getDb();
    const agent = getAgentByType(db, "research");
    logAgentHistory(db, agent.id, "input", "response", 100, 0.001);
    const history = db
      .prepare("SELECT * FROM agent_history WHERE agent_id = ?")
      .all(agent.id);
    expect(history).toHaveLength(1);
  });

  it("generateSystemPrompt returns prompt from meta-agent", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Du bist ein Experte für..." } }],
        usage: { total_tokens: 50 },
        model: "google/gemini-2.5-pro",
      }),
    });
    const prompt = await generateSystemPrompt(
      "key",
      "google/gemini-2.5-pro",
      "Marktanalyse für GPUs",
      mockFetch as typeof fetch,
    );
    expect(prompt).toContain("Experte");
  });
});
