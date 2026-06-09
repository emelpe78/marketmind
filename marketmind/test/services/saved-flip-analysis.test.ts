import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  createSavedFlipAnalysis,
  deleteSavedFlipAnalysis,
  getSavedFlipAnalysis,
  listSavedFlipAnalyses,
  updateSavedFlipAnalysis,
} from "../../server/services/flipping/saved-flip-analysis";

describe("saved flip analyses", () => {
  it("creates lists updates and deletes saved flip analysis snapshots", () => {
    createTestDb();
    const db = getDb();

    const created = createSavedFlipAnalysis(db, {
      listingUrl: "https://www.kleinanzeigen.de/s-anzeige/test/1",
      listingPlatform: "kleinanzeigen",
      query: "RTX 3060 12GB",
      analysis: "### 1. Kalkulation\nSolide Marge.",
      listing: {
        platform: "kleinanzeigen",
        url: "https://www.kleinanzeigen.de/s-anzeige/test/1",
        title: "RTX 3060 12GB zu verkaufen",
        price: 180,
        condition: "Sehr Gut",
        location: "Berlin",
      },
      marketStats: {
        min: 100,
        max: 500,
        avg: 250,
        median: 240,
        count: 10,
        histogram: [],
        conditionBreakdown: {},
        platformComparison: {},
        demandIndicator: 3,
      },
      marketSamples: [
        {
          title: "RTX 3060",
          price: 200,
          platform: "kleinanzeigen",
          condition: "Gebraucht",
        },
      ],
    });

    expect(created.title).toBe("RTX 3060 12GB zu verkaufen");
    expect(created.analysis).toContain("Kalkulation");
    expect(created.marketSamples).toHaveLength(1);
    expect(listSavedFlipAnalyses(db)).toHaveLength(1);

    const updated = updateSavedFlipAnalysis(db, created.id, {
      title: "GPU Flip",
    });
    expect(updated?.title).toBe("GPU Flip");

    expect(deleteSavedFlipAnalysis(db, created.id)).toBe(true);
    expect(getSavedFlipAnalysis(db, created.id)).toBeNull();
  });
});
