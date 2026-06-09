import { getDb } from "../../database/db";
import { deleteAgent } from "../../services/agents/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deleteAgent(getDb(), Number(id));
  return { success: true };
});
