import { chatCompletion } from "../../services/openrouter/client";
import type { ChatMessage } from "../../services/openrouter/client";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const apiKey = config.openrouterApiKey;
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }
  const body = await readBody<{
    messages: ChatMessage[];
    model?: string;
    temperature?: number;
  }>(event);
  if (!body?.messages?.length) {
    throw createError({ statusCode: 400, message: "Messages fehlen" });
  }
  const model = body.model || config.defaultModel;
  const result = await chatCompletion(
    apiKey,
    model,
    body.messages,
    body.temperature ?? 0.7,
  );
  return result;
});
