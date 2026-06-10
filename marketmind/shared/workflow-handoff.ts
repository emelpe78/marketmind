import type { AnalyzeFlipResult } from "./flipping-types";
import type { InventoryItem } from "./inventory-types";
import type { ListingDetail } from "./listing-detail-types";

export type WorkflowHandoffSource =
  | "research"
  | "research-saved"
  | "flip"
  | "flip-saved"
  | "watchlist"
  | "inventory";

export const WORKFLOW_HANDOFF_BANNER_LABELS: Record<
  WorkflowHandoffSource,
  string
> = {
  research: "Daten aus der Preisrecherche übernommen.",
  "research-saved": "Daten aus einer gespeicherten Recherche übernommen.",
  flip: "Daten aus der Flipping-Analyse übernommen.",
  "flip-saved": "Daten aus einer gespeicherten Flipping-Analyse übernommen.",
  watchlist: "Daten aus der Watchlist übernommen.",
  inventory: "Daten aus dem Inventar übernommen.",
};

const EXTRAS_MAX_LENGTH = 500;

export interface ListingsHandoffRouteInput {
  q: string;
  platform: string;
  searchId?: number;
  savedResearchId?: number;
  savedFlipAnalysisId?: number;
  condition?: string;
  desiredPrice?: number;
  extras?: string;
  from?: WorkflowHandoffSource;
}

export interface ListingsHandoffPrefill {
  query: string;
  platform: "kleinanzeigen" | "ebay";
  searchId?: number;
  savedResearchId?: number;
  savedFlipAnalysisId?: number;
  condition?: string;
  desiredPrice?: number;
  extras?: string;
  handoffSource?: WorkflowHandoffSource;
}

export function researchPlatformToListingPlatform(
  platform: string,
): "kleinanzeigen" | "ebay" {
  if (platform === "ebay") return "ebay";
  return "kleinanzeigen";
}

export function truncateHandoffExtras(
  value: string | null | undefined,
): string {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length <= EXTRAS_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, EXTRAS_MAX_LENGTH - 1)}…`;
}

function listingPlatformOrNull(
  platform: string,
): "kleinanzeigen" | "ebay" | null {
  if (platform === "ebay" || platform === "kleinanzeigen") return platform;
  return null;
}

export function buildFlipRoute(url: string): string {
  const params = new URLSearchParams({
    url: url.trim(),
    from: "watchlist",
  });
  return `/flipping?${params.toString()}`;
}

export function buildListingsRoute(input: ListingsHandoffRouteInput): string {
  const params = new URLSearchParams();
  params.set("q", input.q.trim());
  params.set("platform", researchPlatformToListingPlatform(input.platform));
  if (input.searchId != null) {
    params.set("searchId", String(input.searchId));
  }
  if (input.savedResearchId != null) {
    params.set("savedResearchId", String(input.savedResearchId));
  }
  if (input.savedFlipAnalysisId != null) {
    params.set("savedFlipAnalysisId", String(input.savedFlipAnalysisId));
  }
  if (input.condition?.trim()) {
    params.set("condition", input.condition.trim());
  }
  if (input.desiredPrice != null && Number.isFinite(input.desiredPrice)) {
    params.set("desiredPrice", String(input.desiredPrice));
  }
  const extras = truncateHandoffExtras(input.extras);
  if (extras) {
    params.set("extras", extras);
  }
  if (input.from) {
    params.set("from", input.from);
  }
  return `/listings?${params.toString()}`;
}

function queryParamString(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return "";
}

function parsePositiveInt(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function parseHandoffSource(value: unknown): WorkflowHandoffSource | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const source = value.trim() as WorkflowHandoffSource;
  if (source in WORKFLOW_HANDOFF_BANNER_LABELS) return source;
  return undefined;
}

export function parseListingsHandoffQuery(
  query: Record<string, unknown>,
): ListingsHandoffPrefill | null {
  const q = queryParamString(query.q).trim();
  if (!q) return null;

  const platformRaw = queryParamString(query.platform) || "kleinanzeigen";
  const condition = queryParamString(query.condition).trim();
  const extras = queryParamString(query.extras).trim();

  return {
    query: q,
    platform: researchPlatformToListingPlatform(platformRaw),
    searchId: parsePositiveInt(
      query.searchId ?? queryParamString(query.searchId),
    ),
    savedResearchId: parsePositiveInt(
      query.savedResearchId ?? queryParamString(query.savedResearchId),
    ),
    savedFlipAnalysisId: parsePositiveInt(
      query.savedFlipAnalysisId ?? queryParamString(query.savedFlipAnalysisId),
    ),
    condition: condition || undefined,
    desiredPrice: parseOptionalNumber(
      query.desiredPrice ?? queryParamString(query.desiredPrice),
    ),
    extras: extras || undefined,
    handoffSource: parseHandoffSource(
      query.from ?? queryParamString(query.from),
    ),
  };
}

export interface FlipHandoffPrefill {
  url: string;
  handoffSource?: WorkflowHandoffSource;
}

export function parseFlipHandoffQuery(
  query: Record<string, unknown>,
): FlipHandoffPrefill | null {
  const url = queryParamString(query.url).trim();
  if (!url) return null;
  return {
    url,
    handoffSource: parseHandoffSource(
      query.from ?? queryParamString(query.from),
    ),
  };
}

export function buildListingsPrefillFromFlip(
  result: Pick<AnalyzeFlipResult, "query" | "listing" | "marketStats">,
  options?: { savedFlipAnalysisId?: number; from?: WorkflowHandoffSource },
): ListingsHandoffRouteInput {
  const platform = listingPlatformOrNull(String(result.listing.platform));
  const desiredPrice =
    result.marketStats.count > 0
      ? result.marketStats.median
      : (result.listing.price ?? undefined);

  return {
    q: result.query,
    platform: platform ?? "kleinanzeigen",
    condition: result.listing.condition?.trim() || "Gebraucht",
    desiredPrice: desiredPrice ?? undefined,
    extras: truncateHandoffExtras(result.listing.description),
    savedFlipAnalysisId: options?.savedFlipAnalysisId,
    from:
      options?.from ?? (options?.savedFlipAnalysisId ? "flip-saved" : "flip"),
  };
}

export function canBuildListingsFromFlipListing(
  listing: Pick<ListingDetail, "platform">,
): boolean {
  return listingPlatformOrNull(String(listing.platform)) !== null;
}

export function buildListingsPrefillFromInventory(
  item: Pick<
    InventoryItem,
    "title" | "sell_platform" | "buy_platform" | "sell_price" | "notes"
  >,
): ListingsHandoffRouteInput {
  const platform =
    item.sell_platform?.trim() || item.buy_platform?.trim() || "kleinanzeigen";

  return {
    q: item.title,
    platform,
    desiredPrice: item.sell_price ?? undefined,
    condition: "Gebraucht",
    extras: truncateHandoffExtras(item.notes),
    from: "inventory",
  };
}
