export interface PriceHistogramBucket {
  low: number;
  high: number;
  count: number;
}

export interface PriceStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  count: number;
  histogram: PriceHistogramBucket[];
  conditionBreakdown: Record<string, { count: number; avgPrice: number }>;
  platformComparison: Record<string, { count: number; avgPrice: number }>;
  demandIndicator: number;
}

export const EMPTY_PRICE_STATS: PriceStats = {
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
