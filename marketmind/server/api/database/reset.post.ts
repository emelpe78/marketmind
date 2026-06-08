import { resetDatabase } from "../../services/database/admin";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ confirm?: boolean }>(event);
  if (!body?.confirm) {
    throw createError({
      statusCode: 400,
      message: "Bestätigung erforderlich",
    });
  }

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
