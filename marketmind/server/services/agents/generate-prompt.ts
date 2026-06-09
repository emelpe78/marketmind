import type Database from "better-sqlite3";
import { resolveAgentPromptText } from "shared/agent-prompt";
import { PROMPT_GENERATOR_TEMPERATURE } from "shared/agent-meta";
import { runAgent } from "../ai/run-agent";
import { getAgentByType } from "./repository";

export async function generateAgentPrompt(
  db: Database.Database,
  description: string,
) {
  const agent = getAgentByType(db, "strategy");
  const { content: prompt } = await runAgent(db, {
    agentType: "strategy",
    userInput: `Erstelle einen System-Prompt für folgendes Ziel:\n${description}`,
    systemPrompt: resolveAgentPromptText(agent),
    temperature: PROMPT_GENERATOR_TEMPERATURE,
    mode: "required",
  });

  return { prompt };
}
