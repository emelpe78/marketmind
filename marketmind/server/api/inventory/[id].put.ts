import { getDb } from "../../database/db";
import { updateInventory } from "../../services/inventory/repository";
import type { InventoryItem } from "../../services/inventory/index";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody<InventoryItem>(event);
  return updateInventory(getDb(), Number(id), body);
});
