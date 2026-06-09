import { getDb } from "../../database/db";
import { findAllInventory } from "../../services/inventory/repository";

export default defineEventHandler((event) => {
  const query = getQuery(event);
  return findAllInventory(getDb(), {
    status: query.status as string | undefined,
    platform: query.platform as string | undefined,
    from: query.from as string | undefined,
    to: query.to as string | undefined,
  });
});
