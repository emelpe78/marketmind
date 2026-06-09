import { describe, it, expect } from "vitest";
import { resolveAgentPromptText } from "../../shared/agent-prompt";
import { PROMPT_GENERATOR_SYSTEM_PROMPT } from "../../shared/agent-meta";

describe("resolveAgentPromptText", () => {
  it("uses meta fallback prompt for strategy agent", () => {
    expect(
      resolveAgentPromptText({ type: "strategy", system_prompt: "" }),
    ).toBe(PROMPT_GENERATOR_SYSTEM_PROMPT);
  });

  it("uses custom strategy prompt when set", () => {
    expect(
      resolveAgentPromptText({
        type: "strategy",
        system_prompt: "Eigener Meta-Prompt",
      }),
    ).toBe("Eigener Meta-Prompt");
  });

  it("returns feature agent prompt unchanged", () => {
    expect(
      resolveAgentPromptText({
        type: "research",
        system_prompt: "Research Prompt",
      }),
    ).toBe("Research Prompt");
  });
});
