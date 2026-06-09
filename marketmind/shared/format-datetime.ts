/**
 * SQLite CURRENT_TIMESTAMP is UTC in "YYYY-MM-DD HH:MM:SS" form without offset.
 */
export function parseSqliteUtcDateTime(value: unknown): Date | null {
  if (value == null || value === "") return null;

  const raw = String(value).trim();
  if (!raw) return null;

  if (/[zZ]$/.test(raw) || /[+-]\d{2}:\d{2}$/.test(raw)) {
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const sqliteMatch = raw.match(
    /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?$/,
  );
  if (sqliteMatch) {
    const [, day, time, fraction = ""] = sqliteMatch;
    const date = new Date(`${day}T${time}${fraction}Z`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(raw);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function formatDateTime(value: unknown): string {
  const date = parseSqliteUtcDateTime(value);
  if (!date) {
    return value == null || value === "" ? "–" : String(value);
  }
  return date.toLocaleString("de-DE");
}

export function formatDate(value: unknown): string {
  const date = parseSqliteUtcDateTime(value);
  if (!date) {
    return value == null || value === "" ? "–" : String(value);
  }
  return date.toLocaleDateString("de-DE");
}
