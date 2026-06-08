import type Database from "better-sqlite3";
import type { AiConnection } from "../ai/config";

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

export interface AgentWithStats extends AgentRow {
  total_cost_usd: number;
  call_count: number;
}

export function listAgentsWithStats(db: Database.Database): AgentWithStats[] {
  return db
    .prepare(
      `SELECT a.*,
        COALESCE(stats.total_cost_usd, 0) AS total_cost_usd,
        COALESCE(stats.call_count, 0) AS call_count
      FROM agents a
      LEFT JOIN (
        SELECT agent_id,
          SUM(cost_usd) AS total_cost_usd,
          COUNT(*) AS call_count
        FROM agent_history
        GROUP BY agent_id
      ) stats ON stats.agent_id = a.id
      ORDER BY a.id`,
    )
    .all() as AgentWithStats[];
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
  connection: AiConnection,
  defaultModel: string,
  description: string,
  fetchFn: typeof fetch = fetch,
): Promise<string> {
  const { chatCompletion } = await import("./client");
  const result = await chatCompletion(
    connection,
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
