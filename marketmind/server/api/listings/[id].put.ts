import { defineApiHandler, parseRouteId } from "../../utils/api-handler";
import {
  findListingById,
  updateListing,
} from "../../services/listings/repository";
import { listingUpdateBodySchema } from "../schemas/listings";

export default defineApiHandler(
  listingUpdateBodySchema,
  async (db, body, event) => {
    const id = parseRouteId(event);

    if (!findListingById(db, id)) {
      throw createError({ statusCode: 404, message: "Anzeige nicht gefunden" });
    }

    return updateListing(db, id, {
      query: body.query?.trim() || body.title.trim(),
      platform: body.platform ?? "kleinanzeigen",
      title: body.title.trim(),
      description: body.description.trim(),
      keywords: body.keywords ?? null,
      category: body.category ?? null,
      price_suggestion: body.price_suggestion,
    });
  },
);
