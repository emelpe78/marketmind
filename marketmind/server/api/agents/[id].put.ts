import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import {
  findAgentById,
  updateAgent,
  type AgentRow,
} from "../../services/agents/repository";
import { agentUpdateBodySchema } from "../schemas/agents";

export default defineApiHandler(
  agentUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    const existing = findAgentById(db, id) as AgentRow | undefined;
    if (!existing) {
      throw createError({ statusCode: 404, message: "Agent nicht gefunden" });
    }

    return updateAgent(db, id, {
      name: body.name ?? existing.name,
      type: body.type ?? existing.type,
      model: body.model !== undefined ? body.model : existing.model,
      system_prompt: body.system_prompt ?? existing.system_prompt,
      temperature: body.temperature ?? existing.temperature,
    });
  },
);
