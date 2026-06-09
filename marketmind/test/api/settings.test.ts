import { describe, it, expect } from "vitest";
import { createTestDb } from "../helpers/test-db";
import {
  getAllSettings,
  getSetting,
  setSetting,
} from "../../server/database/settings";
import { getDb } from "../../server/database/db";

describe("settings", () => {
  it("returns default scraper settings", () => {
    createTestDb();
    const db = getDb();
    const settings = getAllSettings(db);

    expect(settings["scraper-delay-min"]).toBe("2");
    expect(settings["scraper-delay-max"]).toBe("5");
    expect(settings["scraper-cache-ttl-hours"]).toBe("6");
    expect(settings["scraper-max-results"]).toBe("100");
  });

  it("persists updated setting value", () => {
    createTestDb();
    const db = getDb();
    setSetting(db, "scraper-delay-min", "3");
    expect(getSetting(db, "scraper-delay-min")).toBe("3");
  });
});
