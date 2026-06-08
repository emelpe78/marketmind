export type DetectedPlatform = "ebay" | "kleinanzeigen";

export function detectPlatformFromUrl(
  url: string | null | undefined,
): DetectedPlatform | null {
  const normalized = String(url ?? "").toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("ebay.")) return "ebay";
  if (normalized.includes("kleinanzeigen.")) return "kleinanzeigen";
  return null;
}
