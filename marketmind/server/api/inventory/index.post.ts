import { getDb } from "../../database/db";
import { createInventory } from "../../services/inventory/repository";
import type { InventoryItem } from "../../services/inventory/index";

export default defineEventHandler(async (event) => {
  const body = await readBody<InventoryItem>(event);
  return createInventory(getDb(), body);
});
