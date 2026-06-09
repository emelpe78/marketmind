import { getDb } from "../../database/db";
import { createAgent } from "../../services/agents/repository";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return createAgent(getDb(), body);
});
