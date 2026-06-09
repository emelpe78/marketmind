import { getDb } from "../../database/db";
import { updatePrompt } from "../../services/prompt-library/repository";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);
  return updatePrompt(getDb(), Number(id), body);
});
