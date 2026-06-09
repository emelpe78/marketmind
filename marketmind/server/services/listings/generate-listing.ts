import type Database from "better-sqlite3";
import { formatEuro } from "shared/format-currency";
import { runAgent } from "../ai/run-agent";
import { getSearchStats } from "../searches/repository";
import { parseListingGeneration } from "./parse-generation";

export interface GenerateListingInput {
  query: string;
  platform: "kleinanzeigen" | "ebay";
  condition: string;
  extras?: string;
  desiredPrice?: number;
  searchId?: number;
}

export async function generateListing(
  db: Database.Database,
  input: GenerateListingInput,
) {
  let priceContext = "";
  if (input.searchId) {
    const stats = getSearchStats(db, input.searchId);
    priceContext = `\nMarktdaten: Durchschnitt ${formatEuro(stats.avg)}, Median ${formatEuro(stats.median)}`;
  }

  const platformHint =
    input.platform === "kleinanzeigen"
      ? "Erstelle eine Kleinanzeigen-Anzeige: Titel max 70 Zeichen, informeller Ton. Antworte als JSON mit: title, description, priceSuggestion, category."
      : "Erstelle eine eBay-Anzeige: Titel max 80 Zeichen, professionell mit Bullet Points. Antworte als JSON mit: title, description, priceSuggestion, category, itemSpecifics (Objekt).";

  const userInput = `${platformHint}\nProdukt: ${input.query}\nZustand: ${input.condition}\nZusatz: ${input.extras || "-"}\nWunschpreis: ${input.desiredPrice || "-"}${priceContext}`;

  const { content } = await runAgent(db, {
    agentType: "listing",
    userInput,
    mode: "required",
  });

  const parsed = parseListingGeneration(content, {
    query: input.query,
    desiredPrice: input.desiredPrice ?? null,
  });

  return {
    platform: input.platform,
    ...parsed,
  };
}
