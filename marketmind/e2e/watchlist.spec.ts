import { test, expect } from "@playwright/test";

test.describe("Watchlist", () => {
  test("can add watchlist item", async ({ page }) => {
    await page.goto("/watchlist");
    await page.getByTestId("watchlist-title").fill("RTX 3060 Test");
    await page.getByTestId("add-watchlist").click();
    await expect(page.getByText("RTX 3060 Test")).toBeVisible();
  });
});
