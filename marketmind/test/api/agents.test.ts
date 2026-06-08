import { describe, it, expect, vi } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  getAgentByType,
  listAgentsWithStats,
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

  it("aggregates total cost and call count per agent", () => {
    createTestDb();
    const db = getDb();
    const research = getAgentByType(db, "research");
    const listing = getAgentByType(db, "listing");
    logAgentHistory(db, research.id, "a", "b", 50, 0.002);
    logAgentHistory(db, research.id, "c", "d", 30, 0.001);
    logAgentHistory(db, listing.id, "e", "f", 10, 0.0005);

    const agents = listAgentsWithStats(db);
    const researchStats = agents.find((a) => a.id === research.id);
    const listingStats = agents.find((a) => a.id === listing.id);
    const strategyStats = agents.find((a) => a.type === "strategy");

    expect(researchStats?.call_count).toBe(2);
    expect(researchStats?.total_cost_usd).toBeCloseTo(0.003);
    expect(listingStats?.call_count).toBe(1);
    expect(listingStats?.total_cost_usd).toBeCloseTo(0.0005);
    expect(strategyStats?.call_count).toBe(0);
    expect(strategyStats?.total_cost_usd).toBe(0);
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
      { apiKey: "key", baseUrl: "https://openrouter.ai/api/v1" },
      "google/gemini-2.5-pro",
      "Marktanalyse für GPUs",
      mockFetch as typeof fetch,
    );
    expect(prompt).toContain("Experte");
  });
});
