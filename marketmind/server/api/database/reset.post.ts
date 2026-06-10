import { defineApiHandler } from "../../utils/api-handler";
import { resetDatabase } from "../../database/lifecycle";
import { databaseResetBodySchema } from "../schemas/database";

export default defineApiHandler(databaseResetBodySchema, async (_db, _body) => {
  try {
    return resetDatabase();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Datenbank konnte nicht zurückgesetzt werden";
    throw createError({ statusCode: 500, message });
  }
});
