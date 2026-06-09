/**
 * Parses German-formatted prices from marketplace text (e.g. "1.234,56 €", "300 € VB").
 * Returns null when no price is present or text indicates VB / free.
 */
export function parseGermanPrice(text: string): number | null {
  if (!text) return null;
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return null;
  if (/^vb$/i.test(normalized) || /zu verschenken/i.test(normalized)) {
    return null;
  }

  const euroMatch = normalized.match(/([\d.]+(?:,\d{1,2})?)\s*€/);
  if (euroMatch?.[1]) {
    const num = Number(euroMatch[1].replace(/\./g, "").replace(",", "."));
    return Number.isFinite(num) ? num : null;
  }

  const genericMatch = normalized.match(/([\d.,]+)/);
  const raw = genericMatch?.[1];
  if (!raw) return null;

  const value = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}
