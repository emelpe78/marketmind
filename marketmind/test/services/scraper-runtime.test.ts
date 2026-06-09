import { describe, it, expect, vi } from "vitest";
import { getDb } from "../../server/database/db";
import { createScraperRuntime } from "../../server/services/scraper/runtime";

describe("ScraperRuntime", () => {
  it("uses independent throttle state per runtime instance", async () => {
    const db = getDb();
    const sleepFn = vi.fn().mockResolvedValue(undefined);
    const fetchFn = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "<html>ok</html>",
      headers: { getSetCookie: () => [] },
    });

    const runtimeA = createScraperRuntime(db, { fetchFn, sleepFn });
    const runtimeB = createScraperRuntime(db, { fetchFn, sleepFn });

    expect(runtimeA.deps.throttle).not.toBe(runtimeB.deps.throttle);

    await runtimeA.fetchPage("https://www.ebay.de/sch/i.html?_nkw=test");
    await runtimeB.fetchPage("https://www.kleinanzeigen.de/s-test/k0");

    expect(fetchFn).toHaveBeenCalledTimes(4);
  });
});
