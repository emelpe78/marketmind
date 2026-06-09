import { isMetaAgent, PROMPT_GENERATOR_SYSTEM_PROMPT } from "./agent-meta";

export interface AgentPromptSource {
  type: string;
  system_prompt: string;
}

export function resolveAgentPromptText(agent: AgentPromptSource): string {
  if (isMetaAgent(agent.type)) {
    return agent.system_prompt.trim() || PROMPT_GENERATOR_SYSTEM_PROMPT;
  }
  return agent.system_prompt;
}
