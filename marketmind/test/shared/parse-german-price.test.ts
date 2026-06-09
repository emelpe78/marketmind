import { describe, it, expect } from "vitest";
import { parseGermanPrice } from "shared/parse-german-price";

describe("parseGermanPrice", () => {
  it("parses euro prices with thousands separator", () => {
    expect(parseGermanPrice("1.200,50 €")).toBe(1200.5);
    expect(parseGermanPrice("300 € VB")).toBe(300);
  });

  it("returns null for VB-only or empty text", () => {
    expect(parseGermanPrice("VB")).toBeNull();
    expect(parseGermanPrice("")).toBeNull();
  });

  it("parses plain numeric fragments", () => {
    expect(parseGermanPrice("125,00")).toBe(125);
  });
});
