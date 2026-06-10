import { z } from "zod";

const nullableNumber = z.union([z.number(), z.null()]).optional();
const nullableString = z.union([z.string(), z.null()]).optional();

export const inventoryCreateBodySchema = z.object({
  title: z.string().min(1, "Titel fehlt"),
  buy_price: nullableNumber,
  buy_platform: nullableString,
  buy_date: nullableString,
  sell_price: nullableNumber,
  sell_platform: nullableString,
  sell_date: nullableString,
  status: z.string().default("gekauft"),
  notes: nullableString,
});

export type InventoryCreateBody = z.infer<typeof inventoryCreateBodySchema>;
