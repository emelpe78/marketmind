import { getDb } from "../../database/db";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
} from "../../services/ai/config";
import { mapDomainError } from "../../services/errors";
import { fetchModels } from "../../services/openrouter/client";

export default defineEventHandler(async () => {
  const db = getDb();
  const ai = getAiConfig(db);

  try {
    assertAiConfigured(ai);
    const models = await fetchModels(getAiConnection(ai));
    return { models };
  } catch (error) {
    const domainError = mapDomainError(error);
    if (domainError) {
      throw createError(domainError);
    }
    throw error;
  }
});
