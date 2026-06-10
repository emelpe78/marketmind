import { defineApiHandler } from "../../utils/api-handler";
import { generateAgentPrompt } from "../../services/agents/generate-prompt";
import { generatePromptBodySchema } from "../schemas/agents";

export default defineApiHandler(generatePromptBodySchema, async (db, body) => {
  return generateAgentPrompt(db, body.description);
});
