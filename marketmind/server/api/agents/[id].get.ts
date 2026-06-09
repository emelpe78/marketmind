import { getDb } from "../../database/db";
import { findAgentById } from "../../services/agents/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  return findAgentById(getDb(), Number(id));
});
