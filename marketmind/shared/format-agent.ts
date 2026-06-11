export function formatTemperature(value: unknown): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
}

export function formatUsdCost(value: unknown): string {
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(num);
}

export function formatAiProvider(value: unknown): string {
  if (value === "openrouter") return "OpenRouter";
  if (value === "local") return "Lokal";
  return "–";
}

export function formatCallsLabel(count: unknown): string {
  const num = Number(count);
  if (!Number.isFinite(num) || num <= 0) return "Keine Aufrufe";
  return num === 1 ? "1 Aufruf" : `${num} Aufrufe`;
}
