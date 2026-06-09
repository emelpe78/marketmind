import { describe, it, expect } from "vitest";
import {
  PLATFORM_LABELS,
  RESEARCH_PLATFORM_LABELS,
  formatPlatformLabel,
} from "../../shared/platform-labels";

describe("platform-labels", () => {
  it("exposes consistent UI labels", () => {
    expect(PLATFORM_LABELS.ebay).toBe("eBay");
    expect(PLATFORM_LABELS.kleinanzeigen).toBe("Kleinanzeigen");
    expect(RESEARCH_PLATFORM_LABELS.both).toBe("Beide");
  });

  it("formats known and unknown platform keys", () => {
    expect(formatPlatformLabel("ebay")).toBe("eBay");
    expect(formatPlatformLabel("both")).toBe("Beide");
    expect(formatPlatformLabel("unknown")).toBe("unknown");
    expect(formatPlatformLabel(null)).toBe("–");
  });
});
