import { describe, expect, it } from "vitest";
import {
  parseListingGeneration,
  parsePriceValue,
} from "../../server/services/listings/parse-generation";

describe("listing generation parser", () => {
  it("extracts plain text fields from json content", () => {
    const result = parseListingGeneration(
      JSON.stringify({
        title: "GTX 1080 Ti",
        description: "Hallo zusammen, ich verkaufe meine GTX 1080 Ti.",
        priceSuggestion: "200 € (fairer Marktpreis)",
        category: "Computer > Grafikkarten",
      }),
      { query: "GTX 1080 Ti" },
    );

    expect(result.title).toBe("GTX 1080 Ti");
    expect(result.description).toBe(
      "Hallo zusammen, ich verkaufe meine GTX 1080 Ti.",
    );
    expect(result.description).not.toContain("{");
    expect(result.priceSuggestion).toBe(200);
    expect(result.category).toBe("Computer > Grafikkarten");
  });

  it("parses german price strings", () => {
    expect(parsePriceValue("1.200,50 €")).toBe(1200.5);
    expect(parsePriceValue(250)).toBe(250);
  });
});
