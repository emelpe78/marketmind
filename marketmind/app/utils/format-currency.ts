export function formatEuro(value: unknown): string {
  if (value == null || value === "") return "–";
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} €`;
}

export function formatEuroDelta(value: unknown): string {
  if (value == null || value === "") return "–";
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  const sign = num > 0 ? "+" : "";
  return `${sign}${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} €`;
}
