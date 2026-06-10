import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import { updatePrompt } from "../../services/prompt-library/repository";
import { promptLibraryBodySchema } from "../schemas/prompt-library";

export default defineApiHandler(
  promptLibraryBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    return updatePrompt(db, id, body);
  },
);
