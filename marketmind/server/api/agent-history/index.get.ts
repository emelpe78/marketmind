import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const db = getDb();
  const agentId = getQuery(event).agent_id;
  if (agentId) {
    return db
      .prepare(
        "SELECT * FROM agent_history WHERE agent_id = ? ORDER BY created_at DESC LIMIT 50",
      )
      .all(Number(agentId));
  }
  return db
    .prepare("SELECT * FROM agent_history ORDER BY created_at DESC LIMIT 50")
    .all();
});
