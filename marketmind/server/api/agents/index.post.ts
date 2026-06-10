import { defineApiHandler } from "../../utils/api-handler";
import { createAgent } from "../../services/agents/repository";
import { agentCreateBodySchema } from "../schemas/agents";

export default defineApiHandler(agentCreateBodySchema, async (db, body) => {
  return createAgent(db, body);
});
