import { describe, it, expect } from "vitest";
import {
  formatDateTime,
  parseSqliteUtcDateTime,
} from "../../shared/format-datetime";

describe("format-datetime", () => {
  it("parses sqlite utc timestamps as UTC", () => {
    const date = parseSqliteUtcDateTime("2026-06-09 09:05:56");
    expect(date?.toISOString()).toBe("2026-06-09T09:05:56.000Z");
  });

  it("formats sqlite utc timestamps in local de-DE locale", () => {
    const formatted = formatDateTime("2026-06-09 09:05:56");
    const expected = new Date("2026-06-09T09:05:56.000Z").toLocaleString(
      "de-DE",
    );
    expect(formatted).toBe(expected);
  });

  it("returns dash for empty values", () => {
    expect(formatDateTime(null)).toBe("–");
    expect(formatDateTime("")).toBe("–");
  });
});
