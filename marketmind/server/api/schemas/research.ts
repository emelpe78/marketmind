import { z } from "zod";

const platformSchema = z.enum(["ebay", "kleinanzeigen", "both"]);

export const researchRunBodySchema = z.object({
  query: z.string().optional(),
  platform: platformSchema.optional(),
  searchId: z.number().int().positive().optional(),
  analyze: z.boolean().optional(),
  save: z.boolean().optional(),
  saveName: z.string().optional(),
});

export type ResearchRunBody = z.infer<typeof researchRunBodySchema>;
