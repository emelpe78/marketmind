import { restoreDatabaseFromSql } from "../../database/lifecycle";

const MAX_SQL_BACKUP_BYTES = 100 * 1024 * 1024;

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  if (!parts?.length) {
    throw createError({
      statusCode: 400,
      message: "SQL-Datei fehlt",
    });
  }

  const confirmPart = parts.find((part) => part.name === "confirm");
  if (confirmPart?.data.toString("utf-8") !== "true") {
    throw createError({
      statusCode: 400,
      message: "Bestätigung erforderlich",
    });
  }

  const filePart = parts.find(
    (part) => part.name === "sql" && part.filename && part.data.length > 0,
  );
  if (!filePart) {
    throw createError({
      statusCode: 400,
      message: "SQL-Datei fehlt",
    });
  }

  if (filePart.data.length > MAX_SQL_BACKUP_BYTES) {
    throw createError({
      statusCode: 400,
      message: "SQL-Datei ist zu groß (max. 100 MB)",
    });
  }

  const sql = filePart.data.toString("utf-8");

  try {
    return restoreDatabaseFromSql(sql);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "SQL-Import fehlgeschlagen";
    throw createError({ statusCode: 400, message });
  }
});
