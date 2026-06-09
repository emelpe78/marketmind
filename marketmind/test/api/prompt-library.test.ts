import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  createPrompt,
  deletePrompt,
  findAllPrompts,
  updatePrompt,
} from "../../server/services/prompt-library/repository";

describe("prompt library repository", () => {
  it("creates, updates and deletes prompts", () => {
    createTestDb();
    const db = getDb();

    const research = db
      .prepare("SELECT id FROM agents WHERE type = 'research'")
      .get() as { id: number };

    const created = createPrompt(db, {
      name: "Test-Prompt",
      prompt: "Du bist ein Test-Agent.",
      agent_id: research.id,
    });
    expect(created).toMatchObject({
      name: "Test-Prompt",
      prompt: "Du bist ein Test-Agent.",
      agent_id: research.id,
    });

    const updated = updatePrompt(db, Number(created.id), {
      name: "Test-Prompt v2",
      prompt: "Du bist ein aktualisierter Agent.",
      agent_id: null,
    });
    expect(updated).toMatchObject({
      name: "Test-Prompt v2",
      prompt: "Du bist ein aktualisierter Agent.",
      agent_id: null,
    });

    expect(findAllPrompts(db)).toHaveLength(1);

    const deleted = deletePrompt(db, Number(created.id));
    expect(deleted).toBe(true);
    expect(findAllPrompts(db)).toHaveLength(0);
  });

  it("allows only one prompt per agent assignment", () => {
    createTestDb();
    const db = getDb();
    const research = db
      .prepare("SELECT id FROM agents WHERE type = 'research'")
      .get() as { id: number };

    const first = createPrompt(db, {
      name: "Prompt A",
      prompt: "A",
      agent_id: research.id,
    });
    const second = createPrompt(db, {
      name: "Prompt B",
      prompt: "B",
      agent_id: research.id,
    });

    const prompts = findAllPrompts(db);
    expect(prompts).toHaveLength(1);
    expect(second?.agent_id).toBe(research.id);
    expect(prompts.some((prompt) => prompt.id === first.id)).toBe(false);

    const agent = db
      .prepare("SELECT system_prompt FROM agents WHERE id = ?")
      .get(research.id) as { system_prompt: string };
    expect(agent.system_prompt).toBe("B");
  });
});
