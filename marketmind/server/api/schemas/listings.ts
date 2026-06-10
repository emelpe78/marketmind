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
