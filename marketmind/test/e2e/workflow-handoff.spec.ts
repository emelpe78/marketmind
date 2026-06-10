import { test, expect } from "@playwright/test";

test.describe("Workflow handoffs", () => {
  test("prefills listings form from research handoff query", async ({
    page,
  }) => {
    await page.goto(
      "/listings?q=RTX+3060&platform=kleinanzeigen&from=research&desiredPrice=199",
    );
    await expect(page.getByTestId("listing-query")).toHaveValue("RTX 3060");
    await expect(page.getByTestId("workflow-handoff-banner")).toBeVisible();
    await expect(page.getByTestId("workflow-handoff-banner")).toContainText(
      "Preisrecherche",
    );
  });

  test("prefills flipping url from watchlist handoff query", async ({
    page,
  }) => {
    const url = "https://www.kleinanzeigen.de/s-anzeige/test/123456789";
    await page.goto(`/flipping?url=${encodeURIComponent(url)}&from=watchlist`);
    await expect(page.getByTestId("flip-input")).toHaveValue(url);
    await expect(page.getByTestId("workflow-handoff-banner")).toBeVisible();
  });

  test("hides flip handoff button on watchlist without listing url", async ({
    page,
  }) => {
    await page.goto("/watchlist");
    await page.getByTestId("watchlist-title").fill("Ohne URL");
    await page.getByTestId("add-watchlist").click();
    await expect(page.getByText("Ohne URL")).toBeVisible();
    await expect(page.getByTestId("handoff-flip")).toHaveCount(0);
    await expect(page.getByTestId("handoff-inventory").first()).toBeVisible();
  });
});
