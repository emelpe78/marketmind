import { getDb } from "../../database/db";
import { listAgentsWithStats } from "../../services/agents/repository";

export default defineEventHandler(() => {
  const db = getDb();
  return listAgentsWithStats(db);
});
