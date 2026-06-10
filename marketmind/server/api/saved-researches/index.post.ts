import { defineApiHandler } from "../../utils/api-handler";
import { createSavedResearch } from "../../services/research/saved-research";
import { savedResearchCreateBodySchema } from "../schemas/saved-research";

export default defineApiHandler(
  savedResearchCreateBodySchema,
  async (db, body) => {
    return createSavedResearch(db, body);
  },
);
