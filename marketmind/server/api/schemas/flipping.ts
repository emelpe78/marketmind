import { z } from "zod";

export const flippingAnalyzeBodySchema = z.object({
  url: z.string().min(1, "Anzeigen-URL fehlt"),
});

export type FlippingAnalyzeBody = z.infer<typeof flippingAnalyzeBodySchema>;

const flipListingSchema = z.object({
  platform: z.string(),
  url: z.string(),
  title: z.string(),
  price: z.number().nullable(),
  condition: z.string().nullable(),
  location: z.string().nullable(),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

const flipMarketSampleSchema = z.object({
  title: z.string(),
  price: z.number(),
  platform: z.string(),
  condition: z.string().nullable(),
});

const priceStatsSchema = z.object({
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  median: z.number(),
  count: z.number(),
  histogram: z.array(
    z.object({
      low: z.number(),
      high: z.number(),
      count: z.number(),
    }),
  ),
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

export const savedFlipAnalysisBodySchema = z.object({
  title: z.string().optional(),
  listingUrl: z.string().min(1, "Anzeigen-URL fehlt"),
  listingPlatform: z.string().min(1, "Plattform fehlt"),
  query: z.string().min(1, "Suchbegriff fehlt"),
  analysis: z.string().min(1, "Analyse fehlt"),
  listing: flipListingSchema,
  marketStats: priceStatsSchema,
  marketSamples: z.array(flipMarketSampleSchema),
});

export type SavedFlipAnalysisBody = z.infer<typeof savedFlipAnalysisBodySchema>;

export const savedFlipFromUrlBodySchema = z.object({
  url: z.string().min(1, "Anzeigen-URL fehlt"),
  title: z.string().optional(),
});

export type SavedFlipFromUrlBody = z.infer<typeof savedFlipFromUrlBodySchema>;
