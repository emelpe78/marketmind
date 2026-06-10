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
