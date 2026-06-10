import { defineApiHandler } from "../../utils/api-handler";
import { createPrompt } from "../../services/prompt-library/repository";
import { promptLibraryBodySchema } from "../schemas/prompt-library";

export default defineApiHandler(promptLibraryBodySchema, async (db, body) => {
  return createPrompt(db, body);
});
