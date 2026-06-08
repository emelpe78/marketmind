import { relocateDatabase } from "../../services/database/admin";

export default defineEventHandler(async (event) => {
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
