import { describe, expect, it } from "vitest";
import { AGENTS_FETCH_KEYS, FETCH_KEYS } from "../../app/utils/fetch-keys";

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
});
