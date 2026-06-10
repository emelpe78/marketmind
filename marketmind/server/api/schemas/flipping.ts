import { z } from "zod";
import { priceStatsSchema } from "./common";

export const flippingAnalyzeBodySchema = z.object({
  url: z.string().min(1, "Anzeigen-URL fehlt"),
});

export type FlippingAnalyzeBody = z.infer<typeof flippingAnalyzeBodySchema>;

const flipListingSchema = z.object({
  platform: z.enum(["ebay", "kleinanzeigen"]),
  url: z.string(),
  title: z.string(),
  price: z.number().nullable(),
  condition: z.string().nullable(),
  location: z.string().nullable(),
  category: z.string().nullable(),
  description: z.string().nullable(),
});

const flipMarketSampleSchema = z.object({
  title: z.string(),
  price: z.number(),
  platform: z.string(),
  condition: z.string().nullable(),
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
