import { getDb } from "../../database/db";
import { chatCompletion } from "../../services/openrouter/client";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
} from "../../services/openrouter/agents";
import { calculateFlip } from "../../services/flipping/calculator";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    buyPrice: number;
    sellPrice: number;
    shipping: number;
    packaging: number;
    productName?: string;
  }>(event);

  const calculation = calculateFlip({
    buyPrice: body.buyPrice,
    sellPrice: body.sellPrice,
    shipping: body.shipping,
    packaging: body.packaging,
  });

  const config = useRuntimeConfig();
  let recommendation = "";

  if (config.openrouterApiKey) {
    const db = getDb();
    const agent = getAgentByType(db, "analytics");
    const model = resolveAgentModel(agent, config.defaultModel);
    const userInput = `Bewerte Flipping (privater Verkauf, keine Gebühren): ${body.productName || "Artikel"}, Einkauf ${body.buyPrice}€, Verkauf ${body.sellPrice}€, Marge ${calculation.marginPercent.toFixed(1)}%`;
    const completion = await chatCompletion(
      config.openrouterApiKey,
      model,
      [
        { role: "system", content: agent.system_prompt },
        { role: "user", content: userInput },
      ],
      agent.temperature,
    );
    recommendation = completion.content;
    logAgentHistory(
      db,
      agent.id,
      userInput,
      completion.content,
      completion.tokensUsed,
      completion.costUsd,
    );
  }

  return { ...calculation, recommendation };
});
