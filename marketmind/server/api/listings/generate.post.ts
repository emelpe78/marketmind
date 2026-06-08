import { getDb } from "../../database/db";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
} from "../../services/ai/config";
import { chatCompletion } from "../../services/openrouter/client";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
} from "../../services/openrouter/agents";
import { formatEuro } from "../../../app/utils/format-currency";
import { parseListingGeneration } from "../../services/listings/parse-generation";
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

  const db = getDb();
  const ai = getAiConfig(db);
  assertAiConfigured(ai);
  const agent = getAgentByType(db, "listing");
  const model = resolveAgentModel(agent, ai.defaultModel);

  let priceContext = "";
  if (body.searchId) {
    const results = db
      .prepare("SELECT price FROM search_results WHERE search_id = ?")
      .all(body.searchId) as { price: number }[];
    const stats = analyzePrices(
      results.map((r) => ({ price: r.price, platform: body.platform })),
    );
    priceContext = `\nMarktdaten: Durchschnitt ${formatEuro(stats.avg)}, Median ${formatEuro(stats.median)}`;
  }

  const platformHint =
    body.platform === "kleinanzeigen"
      ? "Erstelle eine Kleinanzeigen-Anzeige: Titel max 70 Zeichen, informeller Ton. Antworte als JSON mit: title, description, priceSuggestion, category."
      : "Erstelle eine eBay-Anzeige: Titel max 80 Zeichen, professionell mit Bullet Points. Antworte als JSON mit: title, description, priceSuggestion, category, itemSpecifics (Objekt).";

  const userInput = `${platformHint}\nProdukt: ${body.query}\nZustand: ${body.condition}\nZusatz: ${body.extras || "-"}\nWunschpreis: ${body.desiredPrice || "-"}${priceContext}`;

  const completion = await chatCompletion(
    getAiConnection(ai),
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

  const parsed = parseListingGeneration(completion.content, {
    query: body.query,
    desiredPrice: body.desiredPrice ?? null,
  });

  return {
    platform: body.platform,
    ...parsed,
  };
});
