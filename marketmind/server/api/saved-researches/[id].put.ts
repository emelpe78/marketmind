import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import { updateSavedResearch } from "../../services/research/saved-research";
import { titleUpdateBodySchema } from "../schemas/common";

export default defineApiHandler(
  titleUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    const updated = updateSavedResearch(db, id, { title: body.title });
    if (!updated) {
      throw createError({
        statusCode: 404,
        message: "Gespeicherte Recherche nicht gefunden",
      });
    }
    return updated;
  },
);
