import { generateSystemPrompt } from "../../services/openrouter/agents";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const body = await readBody<{ description: string }>(event);
  if (!body?.description) {
    throw createError({ statusCode: 400, message: "Beschreibung fehlt" });
  }
  if (!config.openrouterApiKey) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }
  const prompt = await generateSystemPrompt(
    config.openrouterApiKey,
    config.defaultModel,
    body.description,
  );
  return { prompt };
});
