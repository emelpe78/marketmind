import { defineApiHandler } from "../../utils/api-handler";
import { createListing } from "../../services/listings/repository";
import { listingCreateBodySchema } from "../schemas/listings";

export default defineApiHandler(listingCreateBodySchema, async (db, body) => {
  return createListing(db, {
    query: body.query?.trim() || body.title.trim(),
    platform: body.platform ?? "kleinanzeigen",
    title: body.title.trim(),
    description: body.description.trim(),
    keywords: body.keywords ?? null,
    category: body.category ?? null,
    price_suggestion: body.price_suggestion,
  });
});
