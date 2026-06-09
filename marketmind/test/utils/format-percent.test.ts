import { describe, expect, it } from "vitest";
import { formatPercent } from "shared/format-percent";

describe("format-percent", () => {
  it("formats percent values in de-DE style", () => {
    expect(formatPercent(33.333)).toBe("33,33 %");
    expect(formatPercent(85)).toBe("85,00 %");
    expect(formatPercent(12.5)).toBe("12,50 %");
    expect(formatPercent(null)).toBe("–");
  });
});
