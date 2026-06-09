import type Database from "better-sqlite3";
import { resolveAgentPromptText } from "shared/agent-prompt";
import type { AgentRow } from "../agents/repository";

export function syncAgentPromptToLibrary(
  db: Database.Database,
  agent: AgentRow,
): void {
  const prompt = resolveAgentPromptText(agent);
  if (!prompt.trim()) return;

  const existing = db
    .prepare("SELECT id FROM prompt_library WHERE agent_id = ?")
    .get(agent.id) as { id: number } | undefined;

  if (existing) {
    db.prepare(
      "UPDATE prompt_library SET name = ?, prompt = ? WHERE agent_id = ?",
    ).run(agent.name, prompt, agent.id);
    return;
  }

  db.prepare(
    "INSERT INTO prompt_library (name, prompt, agent_id) VALUES (?, ?, ?)",
  ).run(agent.name, prompt, agent.id);
}

export function syncAllAgentPrompts(db: Database.Database): void {
  const agents = db
    .prepare("SELECT * FROM agents ORDER BY id")
    .all() as AgentRow[];

  for (const agent of agents) {
    syncAgentPromptToLibrary(db, agent);
  }
}
