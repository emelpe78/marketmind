import { getDb } from "../../database/db";
import { runAgent } from "../../services/ai/run-agent";
import { formatEuro } from "shared/format-currency";
import { formatPercent } from "shared/format-percent";
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

  const db = getDb();
  const userInput = `Bewerte Flipping (privater Verkauf, keine Gebühren): ${body.productName || "Artikel"}, Einkauf ${formatEuro(body.buyPrice)}, Verkauf ${formatEuro(body.sellPrice)}, Marge ${formatPercent(calculation.marginPercent)}`;

  const { content: recommendation } = await runAgent(db, {
    agentType: "analytics",
    userInput,
    mode: "optional",
  });

  return { ...calculation, recommendation };
});
