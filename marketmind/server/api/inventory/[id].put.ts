import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import {
  findInventoryById,
  updateInventory,
} from "../../services/inventory/repository";
import type { InventoryItem } from "../../services/inventory/index";
import { inventoryUpdateBodySchema } from "../schemas/inventory";

export default defineApiHandler(
  inventoryUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    const existing = findInventoryById(db, id);
    if (!existing) {
      throw createError({
        statusCode: 404,
        message: "Inventar-Eintrag nicht gefunden",
      });
    }

    const merged: InventoryItem = {
      ...existing,
      ...body,
      title: body.title ?? existing.title,
      status: body.status ?? existing.status,
    };

    return updateInventory(db, id, merged);
  },
);
