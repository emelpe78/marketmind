import { getDb } from "../../database/db";
import { listAgentsWithStats } from "../../services/openrouter/agents";

export default defineEventHandler(() => {
  const db = getDb();
  return listAgentsWithStats(db);
});
