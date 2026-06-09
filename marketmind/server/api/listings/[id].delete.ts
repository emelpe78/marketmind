import { getDb } from "../../database/db";
import { deleteListing } from "../../services/listings/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deleteListing(getDb(), Number(id));
  return { success: true };
});
