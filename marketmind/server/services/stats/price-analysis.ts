import type { PriceHistogramBucket, PriceStats } from "shared/price-stats";

export type { PriceHistogramBucket, PriceStats } from "shared/price-stats";

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
  if (sorted.length % 2) return sorted[mid] ?? 0;
  const low = sorted[mid - 1];
  const high = sorted[mid];
  return low != null && high != null ? (low + high) / 2 : 0;
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
  const histogram: PriceHistogramBucket[] = [];
  for (let i = 0; i < 5; i++) {
    const low = min + i * bucketSize;
    const high = i === 4 ? max : low + bucketSize;
    const bucketCount = prices.filter(
      (p) => p >= low && (i === 4 ? p <= high : p < high),
    ).length;
    histogram.push({ low, high, count: bucketCount });
  }

  const conditionBreakdown: Record<
    string,
    { count: number; avgPrice: number }
  > = {};
  for (const r of results) {
    const cond = r.condition || "Unbekannt";
    const condEntry = conditionBreakdown[cond] ?? { count: 0, avgPrice: 0 };
    conditionBreakdown[cond] = condEntry;
    condEntry.count++;
    condEntry.avgPrice += r.price;
  }
  for (const cond of Object.keys(conditionBreakdown)) {
    const entry = conditionBreakdown[cond];
    if (entry) entry.avgPrice /= entry.count;
  }

  const platformComparison: Record<
    string,
    { count: number; avgPrice: number }
  > = {};
  for (const r of results) {
    const platformEntry = platformComparison[r.platform] ?? {
      count: 0,
      avgPrice: 0,
    };
    platformComparison[r.platform] = platformEntry;
    platformEntry.count++;
    platformEntry.avgPrice += r.price;
  }
  for (const p of Object.keys(platformComparison)) {
    const entry = platformComparison[p];
    if (entry) entry.avgPrice /= entry.count;
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
