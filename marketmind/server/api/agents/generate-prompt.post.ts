import { getDb } from "../../database/db";
import { runAgent } from "../../services/ai/run-agent";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ description: string }>(event);
  if (!body?.description) {
    throw createError({ statusCode: 400, message: "Beschreibung fehlt" });
  }

  const db = getDb();
  const { content: prompt } = await runAgent(db, {
    agentType: "strategy",
    userInput: `Erstelle einen System-Prompt für folgendes Ziel:\n${body.description}`,
    systemPrompt:
      "Du erstellst präzise System-Prompts für KI-Agents. Antworte nur mit dem System-Prompt, ohne Erklärung.",
    temperature: 0.7,
    mode: "required",
  });

  return { prompt };
});
