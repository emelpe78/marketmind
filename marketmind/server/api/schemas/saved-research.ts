import { z } from "zod";
import { priceStatsSchema } from "./common";

const savedResearchResultSchema = z.object({
  title: z.string(),
  price: z.number(),
  url: z.string(),
  platform: z.string(),
  condition: z.string().nullable().optional(),
});

const savedResearchAnalysisSchema = z.object({
  platform: z.enum(["ebay", "kleinanzeigen"]),
  summary: z.string(),
});

export const savedResearchCreateBodySchema = z.object({
  title: z.string().optional(),
  query: z.string().min(1, "Suchbegriff fehlt"),
  platform: z.string().min(1, "Plattform fehlt"),
  searchId: z.number().int().positive().nullable().optional(),
  stats: priceStatsSchema,
  results: z.array(savedResearchResultSchema),
  analyses: z.array(savedResearchAnalysisSchema).optional(),
});

export type SavedResearchCreateBody = z.infer<
  typeof savedResearchCreateBodySchema
>;
