import { getDb } from "../../database/db";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
} from "../../services/ai/config";
import { generateSystemPrompt } from "../../services/openrouter/agents";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ description: string }>(event);
  if (!body?.description) {
    throw createError({ statusCode: 400, message: "Beschreibung fehlt" });
  }

  const db = getDb();
  const ai = getAiConfig(db);
  assertAiConfigured(ai);

  const prompt = await generateSystemPrompt(
    getAiConnection(ai),
    ai.defaultModel,
    body.description,
  );
  return { prompt };
});
