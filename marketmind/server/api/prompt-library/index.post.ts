import { getDb } from "../../database/db";
import { createPrompt } from "../../services/prompt-library/repository";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return createPrompt(getDb(), body);
});
