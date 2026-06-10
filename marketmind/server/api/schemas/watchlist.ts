import { z } from "zod";

export const watchlistCreateBodySchema = z.object({
  title: z.string().min(1, "Titel fehlt"),
  url: z.string().nullable().optional(),
  target_price: z.number().nullable().optional(),
  status: z.string().optional(),
});

export const watchlistUpdateBodySchema = z.object({
  title: z.string().optional(),
  url: z.string().nullable().optional(),
  target_price: z.number().nullable().optional(),
  current_price: z.number().nullable().optional(),
  alert_active: z.number().optional(),
  status: z.string().optional(),
});

export type WatchlistCreateBody = z.infer<typeof watchlistCreateBodySchema>;
export type WatchlistUpdateBody = z.infer<typeof watchlistUpdateBodySchema>;
