import type Database from "better-sqlite3";
import { resolveAgentPromptText } from "shared/agent-prompt";
import { findPromptByAgentId } from "../prompt-library/repository";
import { getAgentByType } from "./repository";

export function resolveActiveAgentPrompt(
  db: Database.Database,
  agentType: string,
): string {
  const agent = getAgentByType(db, agentType);
  const libraryPrompt = findPromptByAgentId(db, agent.id);
  if (libraryPrompt?.prompt.trim()) {
    return libraryPrompt.prompt;
  }
  return resolveAgentPromptText(agent);
}
