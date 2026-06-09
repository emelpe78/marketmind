import { getDb } from "../../database/db";
import { deletePrompt } from "../../services/prompt-library/repository";

export default defineEventHandler((event) => {
  const id = getRouterParam(event, "id");
  deletePrompt(getDb(), Number(id));
  return { success: true };
});
