import { z } from "zod";

const platformSchema = z.enum(["ebay", "kleinanzeigen", "both"]);

const analysisSchema = z.object({
  platform: z.enum(["ebay", "kleinanzeigen"]),
  summary: z.string(),
});

export const researchRunBodySchema = z.object({
  query: z.string().optional(),
  platform: platformSchema.optional(),
  searchId: z.number().int().positive().optional(),
  analyze: z.boolean().optional(),
  save: z.boolean().optional(),
  saveName: z.string().optional(),
  analyses: z.array(analysisSchema).optional(),
});

export type ResearchRunBody = z.infer<typeof researchRunBodySchema>;
