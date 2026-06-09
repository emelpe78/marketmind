import type Database from "better-sqlite3";

export function clearAgentAssignmentExcept(
  db: Database.Database,
  agentId: number,
  promptId: number,
): void {
  db.prepare("DELETE FROM prompt_library WHERE agent_id = ? AND id != ?").run(
    agentId,
    promptId,
  );
}

export function applyPromptToAgent(
  db: Database.Database,
  agentId: number,
  prompt: string,
): void {
  db.prepare("UPDATE agents SET system_prompt = ? WHERE id = ?").run(
    prompt,
    agentId,
  );
}
