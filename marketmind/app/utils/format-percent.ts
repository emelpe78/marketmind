export function formatPercent(value: unknown): string {
  if (value == null || value === "") return "–";
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  return `${new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)} %`;
}
