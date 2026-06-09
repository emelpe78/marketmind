import { getDb } from "../../database/db";
import { setSetting } from "../../database/settings";

export default defineEventHandler(async (event) => {
  const key = getRouterParam(event, "key");
  if (!key) {
    throw createError({ statusCode: 400, message: "Key fehlt" });
  }
  const body = await readBody<{ value: string }>(event);
  if (body?.value === undefined) {
    throw createError({ statusCode: 400, message: "Value fehlt" });
  }
  const db = getDb();
  setSetting(db, key, String(body.value));
  return { key, value: body.value };
});
