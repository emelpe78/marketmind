import type Database from "better-sqlite3";

export interface AgentRow {
  id: number;
  name: string;
  type: string;
  model: string | null;
  system_prompt: string;
  temperature: number;
}

export function getAgentByType(db: Database.Database, type: string): AgentRow {
  const agent = db.prepare("SELECT * FROM agents WHERE type = ?").get(type) as
    | AgentRow
    | undefined;
  if (!agent) {
    throw new Error(`Agent type "${type}" not found`);
  }
  return agent;
}

export function getAgentById(
  db: Database.Database,
  id: number,
): AgentRow | undefined {
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(id) as
    | AgentRow
    | undefined;
}

export function resolveAgentModel(
  agent: AgentRow,
  defaultModel: string,
): string {
  return agent.model || defaultModel;
}

export function logAgentHistory(
  db: Database.Database,
  agentId: number,
  userInput: string,
  response: string,
  tokensUsed: number,
  costUsd: number,
): void {
  db.prepare(
    "INSERT INTO agent_history (agent_id, user_input, response, tokens_used, cost_usd) VALUES (?, ?, ?, ?, ?)",
  ).run(agentId, userInput, response, tokensUsed, costUsd);
}

export async function generateSystemPrompt(
  apiKey: string,
  defaultModel: string,
  description: string,
  fetchFn: typeof fetch = fetch,
): Promise<string> {
  const { chatCompletion } = await import("./client");
  const result = await chatCompletion(
    apiKey,
    defaultModel,
    [
      {
        role: "system",
        content:
          "Du erstellst präzise System-Prompts für KI-Agents. Antworte nur mit dem System-Prompt, ohne Erklärung.",
      },
      {
        role: "user",
        content: `Erstelle einen System-Prompt für folgendes Ziel:\n${description}`,
      },
    ],
    0.7,
    fetchFn,
  );
  return result.content;
}
