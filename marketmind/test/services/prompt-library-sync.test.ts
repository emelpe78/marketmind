import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import { getAgentByType } from "../../server/services/agents/repository";
import { syncAllAgentPrompts } from "../../server/services/prompt-library/agent-sync";
import { findAllPrompts } from "../../server/services/prompt-library/repository";
import { PROMPT_GENERATOR_SYSTEM_PROMPT } from "../../shared/agent-meta";

describe("prompt library agent sync", () => {
  it("lists all agents including meta agent in prompt library", () => {
    createTestDb();
    const db = getDb();
    syncAllAgentPrompts(db);

    const prompts = findAllPrompts(db);
    const types = ["research", "listing", "analytics", "strategy"];

    for (const type of types) {
      const agent = getAgentByType(db, type);
      const entry = prompts.find((prompt) => prompt.agent_id === agent.id);
      expect(entry).toBeTruthy();
      if (type === "strategy") {
        expect(entry?.prompt).toBe(PROMPT_GENERATOR_SYSTEM_PROMPT);
      } else {
        expect(entry?.prompt).toBe(agent.system_prompt);
      }
    }
  });
});
