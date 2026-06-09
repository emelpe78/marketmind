import { getDb } from "../../database/db";
import { generateAgentPrompt } from "../../services/agents/generate-prompt";
import { mapDomainError } from "../../services/errors";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ description: string }>(event);
  if (!body?.description) {
    throw createError({ statusCode: 400, message: "Beschreibung fehlt" });
  }

  const db = getDb();

  try {
    return await generateAgentPrompt(db, body.description);
  } catch (error) {
    const domainError = mapDomainError(error);
    if (domainError) {
      throw createError(domainError);
    }
    throw error;
  }
});
