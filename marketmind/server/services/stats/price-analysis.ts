import { formatEuro } from "../../../app/utils/format-currency";

export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
  histogram: { range: string; count: number }[];
  conditionBreakdown: Record<string, { count: number; avgPrice: number }>;
  platformComparison: Record<string, { count: number; avgPrice: number }>;
  demandIndicator: number;
}

export interface SearchResultRow {
  price: number;
  condition?: string | null;
  platform: string;
  sold?: number | null;
}

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function analyzePrices(results: SearchResultRow[]): PriceStats {
  const prices = results.map((r) => r.price).filter((p) => p > 0);
  const count = prices.length;

  if (!count) {
    return {
      min: 0,
      max: 0,
      avg: 0,
      median: 0,
      count: 0,
      histogram: [],
      conditionBreakdown: {},
      platformComparison: {},
      demandIndicator: 0,
    };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = prices.reduce((a, b) => a + b, 0) / count;

  const bucketSize = Math.max(1, Math.ceil((max - min) / 5));
  const histogram: { range: string; count: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const low = min + i * bucketSize;
    const high = i === 4 ? max : low + bucketSize;
    const bucketCount = prices.filter(
      (p) => p >= low && (i === 4 ? p <= high : p < high),
    ).length;
    histogram.push({
      range: `${formatEuro(low).replace(/ €$/, "")}–${formatEuro(high)}`,
      count: bucketCount,
    });
  }

  const conditionBreakdown: Record<
    string,
    { count: number; avgPrice: number }
  > = {};
  for (const r of results) {
    const cond = r.condition || "Unbekannt";
    if (!conditionBreakdown[cond]) {
      conditionBreakdown[cond] = { count: 0, avgPrice: 0 };
    }
    conditionBreakdown[cond].count++;
    conditionBreakdown[cond].avgPrice += r.price;
  }
  for (const cond of Object.keys(conditionBreakdown)) {
    conditionBreakdown[cond].avgPrice /= conditionBreakdown[cond].count;
  }

  const platformComparison: Record<
    string,
    { count: number; avgPrice: number }
  > = {};
  for (const r of results) {
    if (!platformComparison[r.platform]) {
      platformComparison[r.platform] = { count: 0, avgPrice: 0 };
    }
    platformComparison[r.platform].count++;
    platformComparison[r.platform].avgPrice += r.price;
  }
  for (const p of Object.keys(platformComparison)) {
    platformComparison[p].avgPrice /= platformComparison[p].count;
  }

  const demandIndicator = results.filter((r) => r.sold === 1).length;

  return {
    min,
    max,
    avg,
    median: median(prices),
    count,
    histogram,
    conditionBreakdown,
    platformComparison,
    demandIndicator,
  };
}
