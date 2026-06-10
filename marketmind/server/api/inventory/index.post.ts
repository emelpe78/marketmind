import { defineApiHandler } from "../../utils/api-handler";
import { createInventory } from "../../services/inventory/repository";
import { inventoryCreateBodySchema } from "../schemas/inventory";

export default defineApiHandler(inventoryCreateBodySchema, async (db, body) => {
  return createInventory(db, {
    title: body.title,
    buy_price: body.buy_price ?? null,
    buy_platform: body.buy_platform ?? null,
    buy_date: body.buy_date ?? null,
    sell_price: body.sell_price ?? null,
    sell_platform: body.sell_platform ?? null,
    sell_date: body.sell_date ?? null,
    status: body.status,
    notes: body.notes ?? null,
  });
});
