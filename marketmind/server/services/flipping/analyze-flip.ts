import type Database from "better-sqlite3";
import { formatEuro } from "shared/format-currency";
import { formatPercent } from "shared/format-percent";
import { calculateFlip } from "shared/flipping-calculator";
import { runAgent } from "../ai/run-agent";

export interface AnalyzeFlipInput {
  buyPrice: number;
  sellPrice: number;
  shipping: number;
  packaging: number;
  productName?: string;
}

export async function analyzeFlip(
  db: Database.Database,
  input: AnalyzeFlipInput,
) {
  const calculation = calculateFlip({
    buyPrice: input.buyPrice,
    sellPrice: input.sellPrice,
    shipping: input.shipping,
    packaging: input.packaging,
  });

  const userInput = `Bewerte Flipping (privater Verkauf, keine Gebühren): ${input.productName || "Artikel"}, Einkauf ${formatEuro(input.buyPrice)}, Verkauf ${formatEuro(input.sellPrice)}, Marge ${formatPercent(calculation.marginPercent)}`;

  const { content: recommendation } = await runAgent(db, {
    agentType: "analytics",
    userInput,
    mode: "optional",
  });

  return { ...calculation, recommendation };
}
