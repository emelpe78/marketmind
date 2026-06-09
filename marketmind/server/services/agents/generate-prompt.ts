import type Database from "better-sqlite3";
import { runAgent } from "../ai/run-agent";

export async function generateAgentPrompt(
  db: Database.Database,
  description: string,
) {
  const { content: prompt } = await runAgent(db, {
    agentType: "strategy",
    userInput: `Erstelle einen System-Prompt für folgendes Ziel:\n${description}`,
    systemPrompt:
      "Du erstellst präzise System-Prompts für KI-Agents. Antworte nur mit dem System-Prompt, ohne Erklärung.",
    temperature: 0.7,
    mode: "required",
  });

  return { prompt };
}
