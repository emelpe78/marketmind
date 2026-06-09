export type DetectedPlatform = "ebay" | "kleinanzeigen";

export function normalizePlatform(value: unknown): DetectedPlatform | null {
  if (value == null || value === "") return null;
  if (value === "ebay" || value === "kleinanzeigen") return value;
  if (typeof value === "object" && value && "value" in value) {
    const platform = (value as { value: unknown }).value;
    if (platform === "ebay" || platform === "kleinanzeigen") return platform;
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
