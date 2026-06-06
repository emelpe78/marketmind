import { getDb } from "../../database/db";
import { chatCompletion } from "../../services/openrouter/client";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
} from "../../services/openrouter/agents";
import { analyzePrices } from "../../services/stats/price-analysis";

interface ListingInput {
  query: string;
  platform: "kleinanzeigen" | "ebay";
  condition: string;
  extras?: string;
  desiredPrice?: number;
  searchId?: number;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ListingInput>(event);
  if (!body?.query || !body?.platform) {
    throw createError({
      statusCode: 400,
      message: "Query und Plattform erforderlich",
    });
  }

  const config = useRuntimeConfig();
  if (!config.openrouterApiKey) {
    throw createError({
      statusCode: 400,
      message: "OpenRouter API-Key nicht konfiguriert",
    });
  }

  const db = getDb();
  const agent = getAgentByType(db, "listing");
  const model = resolveAgentModel(agent, config.defaultModel);

  let priceContext = "";
  if (body.searchId) {
    const results = db
      .prepare("SELECT price FROM search_results WHERE search_id = ?")
      .all(body.searchId) as { price: number }[];
    const stats = analyzePrices(
      results.map((r) => ({ price: r.price, platform: body.platform })),
    );
    priceContext = `\nMarktdaten: Durchschnitt ${stats.avg.toFixed(2)}€, Median ${stats.median.toFixed(2)}€`;
  }

  const platformHint =
    body.platform === "kleinanzeigen"
      ? "Erstelle eine Kleinanzeigen-Anzeige: Titel max 70 Zeichen, informeller Ton. Antworte als JSON mit: title, description, priceSuggestion, category."
      : "Erstelle eine eBay-Anzeige: Titel max 80 Zeichen, professionell mit Bullet Points. Antworte als JSON mit: title, description, priceSuggestion, category, itemSpecifics (Objekt).";

  const userInput = `${platformHint}\nProdukt: ${body.query}\nZustand: ${body.condition}\nZusatz: ${body.extras || "-"}\nWunschpreis: ${body.desiredPrice || "-"}${priceContext}`;

  const completion = await chatCompletion(
    config.openrouterApiKey,
    model,
    [
      { role: "system", content: agent.system_prompt },
      { role: "user", content: userInput },
    ],
    agent.temperature,
  );

  logAgentHistory(
    db,
    agent.id,
    userInput,
    completion.content,
    completion.tokensUsed,
    completion.costUsd,
  );

  let parsed: Record<string, unknown> = {};
  try {
    const jsonMatch = completion.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch {
    parsed = { title: body.query, description: completion.content };
  }

  return {
    platform: body.platform,
    title: parsed.title || body.query,
    description: parsed.description || completion.content,
    priceSuggestion: parsed.priceSuggestion || body.desiredPrice || null,
    category: parsed.category || null,
    keywords: parsed.itemSpecifics
      ? JSON.stringify(parsed.itemSpecifics)
      : null,
  };
});
