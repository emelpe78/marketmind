import { defineApiHandler } from "../../utils/api-handler";
import { generateListing } from "../../services/listings/generate-listing";
import { listingGenerateBodySchema } from "../schemas/listings";

export default defineApiHandler(listingGenerateBodySchema, async (db, body) => {
  return generateListing(db, {
    query: body.query,
    platform: body.platform,
    condition: body.condition ?? "Gebraucht",
    extras: body.extras,
    desiredPrice: body.desiredPrice,
    searchId: body.searchId,
  });
});
