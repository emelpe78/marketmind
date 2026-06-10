import type Database from "better-sqlite3";
import { syncAgentPromptToLibrary } from "../prompt-library/agent-sync";

export interface AgentInput {
  name: string;
  type: string;
  model?: string | null;
  system_prompt: string;
  temperature?: number;
}

export interface AgentRow {
  id: number;
  name: string;
  type: string;
  model: string | null;
  system_prompt: string;
  temperature: number;
}

export interface AgentWithStats extends AgentRow {
  total_cost_usd: number;
  call_count: number;
}

export function findAgentById(db: Database.Database, id: number) {
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(id);
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

export function countAgentHistory(db: Database.Database): number {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM agent_history")
    .get() as { count: number };
  return row.count;
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

export function createAgent(db: Database.Database, body: AgentInput) {
  const result = db
    .prepare(
      "INSERT INTO agents (name, type, model, system_prompt, temperature) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      body.name,
      body.type,
      body.model ?? null,
      body.system_prompt,
      body.temperature ?? 0.7,
    );
  return findAgentById(db, Number(result.lastInsertRowid));
}

export function updateAgent(
  db: Database.Database,
  id: number,
  body: AgentInput,
) {
  db.prepare(
    "UPDATE agents SET name=?, type=?, model=?, system_prompt=?, temperature=? WHERE id=?",
  ).run(
    body.name,
    body.type,
    body.model ?? null,
    body.system_prompt,
    body.temperature ?? 0.7,
    id,
  );
  const updated = findAgentById(db, id) as AgentRow;
  syncAgentPromptToLibrary(db, updated);
  return updated;
}

export function deleteAgent(db: Database.Database, id: number): boolean {
  const result = db.prepare("DELETE FROM agents WHERE id = ?").run(id);
  return result.changes > 0;
}
