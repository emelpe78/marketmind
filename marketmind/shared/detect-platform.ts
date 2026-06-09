export type DetectedPlatform = "ebay" | "kleinanzeigen";
export type InventoryPlatform = DetectedPlatform | "sonstige";

const INVENTORY_PLATFORMS = new Set<InventoryPlatform>([
  "ebay",
  "kleinanzeigen",
  "sonstige",
]);

function readPlatformValue(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value && "value" in value) {
    const platform = (value as { value: unknown }).value;
    return typeof platform === "string" ? platform : null;
  }
  return null;
}

export function normalizePlatform(value: unknown): DetectedPlatform | null {
  const platform = readPlatformValue(value);
  if (platform === "ebay" || platform === "kleinanzeigen") return platform;
  return null;
}

export function normalizeInventoryPlatform(
  value: unknown,
): InventoryPlatform | null {
  const platform = readPlatformValue(value);
  if (platform && INVENTORY_PLATFORMS.has(platform as InventoryPlatform)) {
    return platform as InventoryPlatform;
  }
  return null;
}

export function detectPlatformFromUrl(
  url: string | null | undefined,
): DetectedPlatform | null {
  const normalized = String(url ?? "").toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("ebay.")) return "ebay";
  if (normalized.includes("kleinanzeigen.")) return "kleinanzeigen";
  return null;
}

export function isListingUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  return detectPlatformFromUrl(trimmed) !== null;
}
