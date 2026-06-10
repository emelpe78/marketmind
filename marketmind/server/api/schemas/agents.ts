import { z } from "zod";

export const agentCreateBodySchema = z.object({
  name: z.string().min(1, "Name fehlt"),
  type: z.string().min(1, "Typ fehlt"),
  model: z.string().nullable().optional(),
  system_prompt: z.string().min(1, "System-Prompt fehlt"),
  temperature: z.number().optional(),
});

export const agentUpdateBodySchema = agentCreateBodySchema.partial();

export const generatePromptBodySchema = z.object({
  description: z.string().min(1, "Beschreibung fehlt"),
});

export type AgentCreateBody = z.infer<typeof agentCreateBodySchema>;
export type AgentUpdateBody = z.infer<typeof agentUpdateBodySchema>;
export type GeneratePromptBody = z.infer<typeof generatePromptBodySchema>;
