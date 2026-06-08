import { describe, expect, it } from "vitest";
import { formatEuro, formatEuroDelta } from "../../app/utils/format-currency";

describe("format-currency", () => {
  it("formats euro values in de-DE style", () => {
    expect(formatEuro(1000)).toBe("1.000,00 €");
    expect(formatEuro(313)).toBe("313,00 €");
    expect(formatEuro(null)).toBe("–");
  });

  it("formats signed profit deltas", () => {
    expect(formatEuroDelta(213)).toBe("+213,00 €");
    expect(formatEuroDelta(-50)).toBe("-50,00 €");
  });
});
