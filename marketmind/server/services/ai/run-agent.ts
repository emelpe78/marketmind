import type Database from "better-sqlite3";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
  isAiConfigured,
} from "./config";
import { chatCompletion } from "../openrouter/client";
import {
  getAgentByType,
  logAgentHistory,
  resolveAgentModel,
} from "../agents/repository";
import { resolveActiveAgentPrompt } from "../agents/prompt-resolve";

export type RunAgentMode = "required" | "optional" | "skip";

export interface RunAgentInput {
  agentType: string;
  userInput: string;
  mode?: RunAgentMode;
  logHistory?: boolean;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  fetchFn?: typeof fetch;
}

export interface RunAgentResult {
  content: string;
  tokensUsed: number;
  costUsd: number;
  agentId: number;
  skipped: boolean;
}

const SKIPPED: RunAgentResult = {
  content: "",
  tokensUsed: 0,
  costUsd: 0,
  agentId: 0,
  skipped: true,
};

export async function runAgent(
  db: Database.Database,
  input: RunAgentInput,
): Promise<RunAgentResult> {
  const mode = input.mode ?? "required";
  const logHistory = input.logHistory ?? true;
  const ai = getAiConfig(db);

  if (mode === "skip") return SKIPPED;

  if (mode === "required") {
    assertAiConfigured(ai);
  } else if (!isAiConfigured(ai)) {
    return SKIPPED;
  }

  const agent = getAgentByType(db, input.agentType);
  const model = input.model ?? resolveAgentModel(agent, ai.defaultModel);
  const systemPrompt =
    input.systemPrompt ?? resolveActiveAgentPrompt(db, input.agentType);
  const temperature = input.temperature ?? agent.temperature;

  const completion = await chatCompletion(
    getAiConnection(ai),
    model,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: input.userInput },
    ],
    temperature,
    input.fetchFn,
  );

  if (logHistory) {
    logAgentHistory(
      db,
      agent.id,
      input.userInput,
      completion.content,
      completion.tokensUsed,
      completion.costUsd,
    );
  }

  return {
    content: completion.content,
    tokensUsed: completion.tokensUsed,
    costUsd: completion.costUsd,
    agentId: agent.id,
    skipped: false,
  };
}
