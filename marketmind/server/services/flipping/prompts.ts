import { formatEuro } from "shared/format-currency";
import type { PriceStats } from "shared/price-stats";
import type { FlipMarketSample } from "shared/flipping-types";
import type { ListingDetail } from "../scraper/listing-detail";

export function buildFlipUserPrompt(input: {
  query: string;
  listing: ListingDetail;
  marketStats: PriceStats;
  marketSamples: FlipMarketSample[];
}): string {
  const lines = [
    "Analysiere das Flipping-Potenzial für den deutschen Gebrauchtmarkt (privater Verkauf, keine Plattformgebühren).",
    `Suchbegriff / Produkt: ${input.query}`,
    "",
    "Quelle: konkrete Anzeige",
    JSON.stringify(
      {
        platform: input.listing.platform,
        url: input.listing.url,
        title: input.listing.title,
        price: input.listing.price,
        condition: input.listing.condition,
        location: input.listing.location,
        category: input.listing.category,
        description: input.listing.description?.slice(0, 2000) ?? null,
      },
      null,
      2,
    ),
  ];

  if (input.listing.price != null) {
    lines.push(
      `Einkaufspreis (Anzeigenpreis): ${formatEuro(input.listing.price)}`,
    );
  }

  lines.push(
    "",
    "Marktdaten (Vergleichsangebote):",
    JSON.stringify(
      {
        stats: input.marketStats,
        samples: input.marketSamples,
      },
      null,
      2,
    ),
  );

  if (input.marketStats.count === 0) {
    lines.push(
      "",
      "Hinweis: Keine Vergleichsangebote verfügbar – Einschätzungen nur auf Basis der Anzeige und Markterfahrung.",
    );
  }

  lines.push(
    "",
    "Strukturiere die Antwort mit ###-Überschriften gemäß deinem System-Prompt.",
    "Nutze die Marktdaten für Verkaufspreis-Schätzung und Nachfragebewertung.",
  );

  return lines.join("\n");
}
