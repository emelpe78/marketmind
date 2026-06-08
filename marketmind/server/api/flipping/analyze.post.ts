import { getDb } from "../../database/db";
import {
  getAiConfig,
  getAiConnection,
  isAiConfigured,
} from "../../services/ai/config";
import { chatCompletion } from "../../services/openrouter/client";
import {
  getAgentByType,
  resolveAgentModel,
  logAgentHistory,
} from "../../services/openrouter/agents";
import { formatEuro } from "../../../app/utils/format-currency";
import { formatPercent } from "../../../app/utils/format-percent";
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

  let recommendation = "";
  const db = getDb();
  const ai = getAiConfig(db);

  if (isAiConfigured(ai)) {
    const agent = getAgentByType(db, "analytics");
    const model = resolveAgentModel(agent, ai.defaultModel);
    const userInput = `Bewerte Flipping (privater Verkauf, keine Gebühren): ${body.productName || "Artikel"}, Einkauf ${formatEuro(body.buyPrice)}, Verkauf ${formatEuro(body.sellPrice)}, Marge ${formatPercent(calculation.marginPercent)}`;
    const completion = await chatCompletion(
      getAiConnection(ai),
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
