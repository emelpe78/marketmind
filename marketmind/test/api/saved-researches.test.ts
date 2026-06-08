import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import { getDb } from "../../server/database/db";
import {
  createSavedResearch,
  deleteSavedResearch,
  getSavedResearch,
  listSavedResearches,
  updateSavedResearch,
} from "../../server/services/research/saved-research";

describe("saved researches", () => {
  it("creates lists updates and deletes saved research snapshots", () => {
    createTestDb();
    const db = getDb();

    const created = createSavedResearch(db, {
      query: "RTX 3060 12GB",
      platform: "kleinanzeigen",
      searchId: null,
      stats: {
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
      results: [
        {
          title: "RTX 3060",
          price: 200,
          url: "https://www.kleinanzeigen.de/s-anzeige/test",
          platform: "kleinanzeigen",
          condition: "Gebraucht",
        },
      ],
      analyses: [
        {
          platform: "kleinanzeigen",
          summary: "## Marktanalyse\nPreise stabil.",
        },
      ],
    });

    expect(created.title).toBe("RTX 3060 12GB");
    expect(created.results).toHaveLength(1);
    expect(created.analyses).toHaveLength(1);
    expect(listSavedResearches(db)).toHaveLength(1);

    const updated = updateSavedResearch(db, created.id, {
      title: "GPU Recherche",
    });
    expect(updated?.title).toBe("GPU Recherche");
    expect(getSavedResearch(db, created.id)?.title).toBe("GPU Recherche");

    expect(deleteSavedResearch(db, created.id)).toBe(true);
    expect(getSavedResearch(db, created.id)).toBeNull();
  });
});
