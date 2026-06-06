import { getDb } from "../../database/db";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  const db = getDb();
  const agent = db.prepare("SELECT * FROM agents WHERE id = ?").get(Number(id));
  if (!agent) {
    throw createError({ statusCode: 404, message: "Agent nicht gefunden" });
  }
  return agent;
});
