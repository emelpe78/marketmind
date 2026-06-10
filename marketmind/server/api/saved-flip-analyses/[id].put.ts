import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import { updateSavedFlipAnalysis } from "../../services/flipping/saved-flip-analysis";
import { titleUpdateBodySchema } from "../schemas/common";

export default defineApiHandler(
  titleUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);
    const updated = updateSavedFlipAnalysis(db, id, { title: body.title });
    if (!updated) {
      throw createError({
        statusCode: 404,
        message: "Gespeicherte Analyse nicht gefunden",
      });
    }
    return updated;
  },
);
