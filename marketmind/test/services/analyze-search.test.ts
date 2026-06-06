import { describe, expect, it } from "vitest";
import { platformsForSearch } from "../../server/services/research/analyze-search";

describe("analyze-search", () => {
  it("requests both platforms when search is both", () => {
    expect(platformsForSearch("both")).toEqual(["ebay", "kleinanzeigen"]);
  });

  it("requests single platform otherwise", () => {
    expect(platformsForSearch("ebay")).toEqual(["ebay"]);
    expect(platformsForSearch("kleinanzeigen")).toEqual(["kleinanzeigen"]);
  });
});
