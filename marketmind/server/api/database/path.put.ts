import { relocateDatabase } from "../../database/lifecycle";
import { isDatabasePathLocked } from "../../database/paths";

export default defineEventHandler(async (event) => {
  if (isDatabasePathLocked()) {
    throw createError({
      statusCode: 409,
      message:
        "Datenbankpfad ist über MM_DATABASE_PATH festgelegt (z. B. Docker). Bitte docker-compose.yml bzw. MARKETMIND_DATA_DIR anpassen.",
    });
  }

  const body = await readBody<{ path?: string }>(event);
  if (!body?.path?.trim()) {
    throw createError({ statusCode: 400, message: "Datenbankpfad fehlt" });
  }

  try {
    return relocateDatabase(body.path);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Pfad konnte nicht geändert werden";
    throw createError({ statusCode: 500, message });
  }
});
