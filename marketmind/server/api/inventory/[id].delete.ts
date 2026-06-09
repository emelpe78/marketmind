import { getDb } from "../../database/db";
import { deleteInventory } from "../../services/inventory/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deleteInventory(getDb(), Number(id));
  return { success: true };
});
