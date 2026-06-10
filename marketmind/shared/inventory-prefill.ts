import type { InventoryPlatform } from "./detect-platform";
import type { InventoryCreatePrefill } from "./inventory-types";
import type { ListingDetail } from "./listing-detail-types";
import { truncateHandoffExtras } from "./workflow-handoff";

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

export interface FlipInventoryPrefillSource {
  title: string;
  platform: string;
  price: number | null;
  url: string;
  condition?: string | null;
  description?: string | null;
}

export function buildFlipInventoryNotes(
  listing: Pick<
    FlipInventoryPrefillSource,
    "url" | "condition" | "description"
  >,
  options?: { savedFlipAnalysisId?: number },
): string {
  const parts: string[] = [];
  if (listing.url.trim()) {
    parts.push(`Anzeige: ${listing.url.trim()}`);
  }
  if (listing.condition?.trim()) {
    parts.push(`Zustand: ${listing.condition.trim()}`);
  }
  const description = truncateHandoffExtras(listing.description);
  if (description) {
    if (parts.length > 0) parts.push("");
    parts.push(description);
  }
  if (options?.savedFlipAnalysisId != null) {
    if (parts.length > 0) parts.push("");
    parts.push(`Flipping-Analyse #${options.savedFlipAnalysisId}`);
  }
  return parts.join("\n");
}

export function buildInventoryPrefillFromFlipListing(
  listing: FlipInventoryPrefillSource,
  options: {
    todayIsoDate: () => string;
    normalizePlatform: (value: unknown) => InventoryPlatform | null;
    savedFlipAnalysisId?: number;
  },
): InventoryCreatePrefill {
  return {
    title: listing.title,
    buy_price: listing.price ?? undefined,
    buy_platform:
      options.normalizePlatform(listing.platform) ?? "kleinanzeigen",
    buy_date: options.todayIsoDate(),
    notes: buildFlipInventoryNotes(listing, {
      savedFlipAnalysisId: options.savedFlipAnalysisId,
    }),
  };
}

export interface WatchlistInventoryPrefillSource {
  title: string;
  url?: string | null;
  target_price?: number | null;
  current_price?: number | null;
  last_scraped?: string | null;
}

export function buildWatchlistInventoryNotes(
  item: WatchlistInventoryPrefillSource,
): string {
  const parts: string[] = [];
  const url = item.url?.trim();
  if (url) {
    parts.push(`Anzeige: ${url}`);
  }
  if (item.target_price != null) {
    parts.push(`Zielpreis: ${item.target_price.toFixed(2)} €`);
  }
  if (item.last_scraped) {
    parts.push(`Zuletzt aktualisiert: ${item.last_scraped}`);
  }
  return parts.join("\n");
}

export function buildInventoryPrefillFromWatchlist(
  item: WatchlistInventoryPrefillSource,
  options: {
    todayIsoDate: () => string;
  },
): InventoryCreatePrefill {
  return {
    title: item.title,
    buy_price: item.current_price ?? undefined,
    buy_date: options.todayIsoDate(),
    notes: buildWatchlistInventoryNotes(item),
  };
}
