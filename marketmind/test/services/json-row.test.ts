import { describe, it, expect } from "vitest";
import { parseJsonColumn } from "../../server/services/persistence/json-row";

describe("parseJsonColumn", () => {
  it("returns fallback for null", () => {
    expect(parseJsonColumn(null, [])).toEqual([]);
  });

  it("parses valid JSON", () => {
    expect(parseJsonColumn('{"a":1}', {})).toEqual({ a: 1 });
  });

  it("returns fallback for corrupt JSON", () => {
    expect(parseJsonColumn("{not json", { ok: false })).toEqual({ ok: false });
  });
});
