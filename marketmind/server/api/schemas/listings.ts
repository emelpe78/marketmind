import { z } from "zod";

export const listingCreateBodySchema = z.object({
  query: z.string().optional(),
  platform: z.string().optional(),
  title: z.string().min(1, "Titel und Beschreibung erforderlich"),
  description: z.string().min(1, "Titel und Beschreibung erforderlich"),
  keywords: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  price_suggestion: z.union([z.number(), z.string()]).nullable().optional(),
});

export type ListingCreateBody = z.infer<typeof listingCreateBodySchema>;

export const listingUpdateBodySchema = listingCreateBodySchema;

export type ListingUpdateBody = z.infer<typeof listingUpdateBodySchema>;

export const listingGenerateBodySchema = z.object({
  query: z.string().min(1, "Query und Plattform erforderlich"),
  platform: z.enum(["kleinanzeigen", "ebay"]),
  condition: z.string().optional(),
  extras: z.string().optional(),
  desiredPrice: z.number().optional(),
  searchId: z.number().int().positive().optional(),
  savedResearchId: z.number().int().positive().optional(),
  savedFlipAnalysisId: z.number().int().positive().optional(),
});

export type ListingGenerateBody = z.infer<typeof listingGenerateBodySchema>;
