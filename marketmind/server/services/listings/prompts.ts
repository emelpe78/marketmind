import { formatEuro } from "shared/format-currency";
import type { PriceStats } from "shared/price-stats";

export function buildListingUserPrompt(input: {
  query: string;
  platform: "kleinanzeigen" | "ebay";
  condition: string;
  extras?: string;
  desiredPrice?: number;
  marketStats?: PriceStats | null;
}): string {
  let priceContext = "";
  if (input.marketStats) {
    priceContext = `\nMarktdaten: Durchschnitt ${formatEuro(input.marketStats.avg)}, Median ${formatEuro(input.marketStats.median)}`;
  }

  const platformHint =
    input.platform === "kleinanzeigen"
      ? "Erstelle eine Kleinanzeigen-Anzeige: Titel max 70 Zeichen, informeller Ton. Antworte als JSON mit: title, description, priceSuggestion, category."
      : "Erstelle eine eBay-Anzeige: Titel max 80 Zeichen, professionell mit Bullet Points. Antworte als JSON mit: title, description, priceSuggestion, category, itemSpecifics (Objekt).";

  return `${platformHint}\nProdukt: ${input.query}\nZustand: ${input.condition}\nZusatz: ${input.extras || "-"}\nWunschpreis: ${input.desiredPrice || "-"}${priceContext}`;
}
