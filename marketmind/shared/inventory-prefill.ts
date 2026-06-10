import type { InventoryPlatform } from "./detect-platform";
import type { InventoryCreatePrefill } from "./inventory-types";

export interface ListingPrefillSource {
  title: string;
  platform: string;
  price_suggestion?: number | null;
  category?: string | null;
  keywords?: string | null;
  description: string;
}

export function buildListingNotes(
  item: Pick<ListingPrefillSource, "category" | "keywords" | "description">,
): string {
  const parts: string[] = [];
  if (item.category?.trim()) {
    parts.push(`Kategorie: ${item.category.trim()}`);
  }
  if (item.keywords?.trim()) {
    parts.push(`Keywords: ${item.keywords.trim()}`);
  }
  if (item.description.trim()) {
    if (parts.length > 0) parts.push("");
    parts.push(item.description.trim());
  }
  return parts.join("\n");
}

export function buildInventoryPrefillFromListing(
  item: ListingPrefillSource,
  options: {
    todayIsoDate: () => string;
    normalizePlatform: (value: unknown) => InventoryPlatform | null;
  },
): InventoryCreatePrefill {
  return {
    title: item.title,
    buy_date: options.todayIsoDate(),
    sell_price: item.price_suggestion ?? undefined,
    sell_platform: options.normalizePlatform(item.platform) ?? "kleinanzeigen",
    notes: buildListingNotes(item),
  };
}
