import { getDb } from "../../../database/db";
import { analyzeSearchByPlatform } from "../../../services/research/analyze-search";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "ID fehlt" });
  }
  const config = useRuntimeConfig();
  const db = getDb();
  const search = db
    .prepare("SELECT * FROM searches WHERE id = ?")
    .get(Number(id)) as { query: string; platform: string } | undefined;
  if (!search) {
    throw createError({ statusCode: 404, message: "Suche nicht gefunden" });
  }

  const apiKey = config.openrouterApiKey;
  if (!apiKey) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }

  const { summaries, tokensUsed } = await analyzeSearchByPlatform(
    db,
    Number(id),
    search,
    apiKey,
    config.defaultModel,
  );

  if (!summaries.length) {
    throw createError({
      statusCode: 400,
      message: "Keine Preisdaten für die Analyse vorhanden",
    });
  }

  return { summaries, tokensUsed };
});
