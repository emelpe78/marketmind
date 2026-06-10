import { describe, expect, it } from "vitest";
import { AGENTS_FETCH_KEYS, FETCH_KEYS } from "../../app/utils/fetch-keys";
import {
  refreshFlippingData,
  refreshInventoryData,
  refreshListingsData,
  refreshResearchData,
} from "../../app/utils/refresh-fetch-data";

describe("fetch-keys", () => {
  it("uses stable unique keys per endpoint", () => {
    const keys = Object.values(FETCH_KEYS);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("groups agent-related keys for coordinated refresh", () => {
    expect(AGENTS_FETCH_KEYS).toEqual([
      FETCH_KEYS.agents,
      FETCH_KEYS.promptLibrary,
      FETCH_KEYS.agentHistory,
    ]);
  });

  it("exports domain refresh bundles", () => {
    expect(typeof refreshResearchData).toBe("function");
    expect(typeof refreshFlippingData).toBe("function");
    expect(typeof refreshListingsData).toBe("function");
    expect(typeof refreshInventoryData).toBe("function");
  });
});
