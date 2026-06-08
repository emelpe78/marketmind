import { getDb } from "../../database/db";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
} from "../../services/ai/config";
import { chatCompletion } from "../../services/openrouter/client";
import type { ChatMessage } from "../../services/openrouter/client";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const ai = getAiConfig(db);
  assertAiConfigured(ai);

  const body = await readBody<{
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
  }>(event);
  if (!body?.messages?.length) {
    throw createError({ statusCode: 400, message: "Messages fehlen" });
  }

  const model = body.model || ai.defaultModel;
  const result = await chatCompletion(
    getAiConnection(ai),
    model,
    body.messages,
    body.temperature ?? 0.7,
  );
  return result;
});
