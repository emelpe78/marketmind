import { fetchModels } from "../../services/openrouter/client";

export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const apiKey = config.openrouterApiKey;
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }
  const models = await fetchModels(apiKey);
  return { models };
});
