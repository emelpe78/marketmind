export const PLATFORM_LABELS = {
  kleinanzeigen: "Kleinanzeigen",
  ebay: "eBay",
} as const;

export const RESEARCH_PLATFORM_LABELS = {
  ...PLATFORM_LABELS,
  both: "Beide",
} as const;

export const PLATFORM_SELECT_OPTIONS = [
  { label: PLATFORM_LABELS.kleinanzeigen, value: "kleinanzeigen" },
  { label: PLATFORM_LABELS.ebay, value: "ebay" },
] as const;

export const RESEARCH_PLATFORM_OPTIONS = [
  ...PLATFORM_SELECT_OPTIONS,
  { label: RESEARCH_PLATFORM_LABELS.both, value: "both" },
] as const;

export function platformLabelFor(
  labels: Record<string, string>,
  key: string,
  fallback?: string,
): string {
  return labels[key] ?? fallback ?? key;
}

export function formatPlatformLabel(value: unknown, fallback = "–"): string {
  if (value == null || value === "") return fallback;
  const key = String(value);
  return platformLabelFor(
    RESEARCH_PLATFORM_LABELS as Record<string, string>,
    key,
    (PLATFORM_LABELS as Record<string, string>)[key] ?? key,
  );
}
