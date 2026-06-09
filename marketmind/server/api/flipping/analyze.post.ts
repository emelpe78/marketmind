import { getDb } from "../../database/db";
import { mapDomainError } from "../../services/errors";
import { analyzeFlip } from "../../services/flipping/analyze-flip";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    buyPrice: number;
    sellPrice: number;
    shipping: number;
    packaging: number;
    productName?: string;
  }>(event);

  const db = getDb();

  try {
    return await analyzeFlip(db, body);
  } catch (error) {
    const domainError = mapDomainError(error);
    if (domainError) {
      throw createError(domainError);
    }
    throw error;
  }
});
