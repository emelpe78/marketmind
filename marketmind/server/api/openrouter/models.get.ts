import { getDb } from "../../database/db";
import {
  assertAiConfigured,
  getAiConfig,
  getAiConnection,
} from "../../services/ai/config";
import { fetchModels } from "../../services/openrouter/client";

export default defineEventHandler(async () => {
  const db = getDb();
  const ai = getAiConfig(db);
  assertAiConfigured(ai);

  const models = await fetchModels(getAiConnection(ai));
  return { models };
});
