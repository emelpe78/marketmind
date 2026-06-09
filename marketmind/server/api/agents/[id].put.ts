import { getDb } from "../../database/db";
import { updateAgent } from "../../services/agents/repository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return updateAgent(getDb(), Number(id), body);
});
