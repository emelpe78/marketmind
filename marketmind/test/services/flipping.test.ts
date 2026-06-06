import { describe, it, expect } from "vitest";
import { calculateFlip } from "../../server/services/flipping/calculator";

describe("flipping calculator", () => {
  it("calculates net proceeds profit and margin", () => {
    const result = calculateFlip({
      buyPrice: 100,
      sellPrice: 200,
      shipping: 10,
      packaging: 5,
    });
    expect(result.netProceeds).toBe(185);
    expect(result.profit).toBe(85);
    expect(result.marginPercent).toBe(85);
    expect(result.score).toBe("Sehr lohnenswert");
  });

  it("assigns correct score thresholds", () => {
    expect(
      calculateFlip({
        buyPrice: 100,
        sellPrice: 120,
        shipping: 0,
        packaging: 0,
      }).score,
    ).toBe("Solide");
    expect(
      calculateFlip({
        buyPrice: 100,
        sellPrice: 110,
        shipping: 0,
        packaging: 0,
      }).score,
    ).toBe("Grenzwertig");
    expect(
      calculateFlip({
        buyPrice: 100,
        sellPrice: 102,
        shipping: 0,
        packaging: 0,
      }).score,
    ).toBe("Nicht empfehlenswert");
  });
});
