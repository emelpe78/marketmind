import { z } from "zod";

export const promptLibraryBodySchema = z.object({
  name: z.string().min(1, "Name fehlt"),
  prompt: z.string().min(1, "Prompt fehlt"),
  agent_id: z.number().int().positive().nullable().optional(),
});

export type PromptLibraryBody = z.infer<typeof promptLibraryBodySchema>;
