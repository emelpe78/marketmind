import { z } from "zod";

export const priceHistogramBucketSchema = z.object({
  low: z.number(),
  high: z.number(),
  count: z.number(),
});

export const priceStatsSchema = z.object({
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  median: z.number(),
  count: z.number(),
  histogram: z.array(priceHistogramBucketSchema),
  conditionBreakdown: z.record(
    z.string(),
    z.object({ count: z.number(), avgPrice: z.number() }),
  ),
  platformComparison: z.record(
    z.string(),
    z.object({ count: z.number(), avgPrice: z.number() }),
  ),
  demandIndicator: z.number(),
});

export const titleUpdateBodySchema = z.object({
  title: z.string().min(1, "Titel fehlt"),
});

export const emptyBodySchema = z.object({}).default({});
