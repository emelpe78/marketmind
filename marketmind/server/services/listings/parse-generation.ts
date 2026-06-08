export interface ParsedListingGeneration {
  title: string;
  description: string;
  priceSuggestion: number | null;
  category: string | null;
  keywords: string | null;
}

export function parsePriceValue(value: unknown): number | null {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(
      /(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)/,
    );
    if (!match) return null;
    const normalized = match[1].replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
  return null;
}

function extractJsonObject(content: string): Record<string, unknown> | null {
  const trimmed = content.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidates = [
    fenceMatch?.[1]?.trim(),
    trimmed,
    trimmed.match(/\{[\s\S]*\}/)?.[0],
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function extractDescription(parsed: Record<string, unknown>): string {
  const value = parsed.description ?? parsed.body ?? parsed.text;
  if (typeof value === "string") return value.trim();
  return "";
}

export function parseListingGeneration(
  content: string,
  fallback: { query: string; desiredPrice?: number | null },
): ParsedListingGeneration {
  const parsed = extractJsonObject(content);

  if (parsed) {
    const description = extractDescription(parsed);
    return {
      title: String(parsed.title || fallback.query).trim(),
      description: description || fallback.query,
      priceSuggestion:
        parsePriceValue(parsed.priceSuggestion ?? parsed.price) ??
        fallback.desiredPrice ??
        null,
      category: parsed.category ? String(parsed.category).trim() : null,
      keywords: parsed.itemSpecifics
        ? JSON.stringify(parsed.itemSpecifics)
        : null,
    };
  }

  return {
    title: fallback.query,
    description: content.trim(),
    priceSuggestion: fallback.desiredPrice ?? null,
    category: null,
    keywords: null,
  };
}
