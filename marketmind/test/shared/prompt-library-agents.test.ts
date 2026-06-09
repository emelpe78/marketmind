import { describe, it, expect } from "vitest";
import {
  agentNameById,
  buildAssignableAgentOptions,
  findAssignedPromptForAgent,
} from "../../shared/prompt-library-agents";

describe("prompt-library-agents", () => {
  const agents = [
    { id: 1, name: "Research Agent", type: "research" },
    { id: 2, name: "Prompt Agent", type: "strategy" },
    { id: 3, name: "Listing Agent", type: "listing" },
  ];

  it("includes meta agents in assignment options", () => {
    const options = buildAssignableAgentOptions(agents);
    expect(options).toHaveLength(4);
    expect(options.map((option) => option.label)).toEqual([
      "Kein Agent",
      "Research Agent",
      "Prompt Agent",
      "Listing Agent",
    ]);
  });

  it("resolves agent names by id", () => {
    expect(agentNameById(agents, 1)).toBe("Research Agent");
    expect(agentNameById(agents, null)).toBe("Kein Agent");
    expect(agentNameById(agents, 99)).toBe("Agent #99");
  });

  it("finds assigned prompt for agent", () => {
    const prompts = [
      { id: 10, name: "Alt", agent_id: 1 },
      { id: 11, name: "Neu", agent_id: null },
    ];
    expect(findAssignedPromptForAgent(prompts, 1, 11)?.name).toBe("Alt");
    expect(findAssignedPromptForAgent(prompts, 1, 10)).toBeUndefined();
  });
});
