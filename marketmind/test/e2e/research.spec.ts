import { test, expect } from "@playwright/test";

test.describe("Research", () => {
  test("shows search form and stats dashboard structure", async ({ page }) => {
    await page.goto("/research");

    await expect(
      page.getByRole("heading", { name: "Preisrecherche" }),
    ).toBeVisible();
    await expect(page.getByTestId("search-query")).toBeVisible();
    await expect(page.getByTestId("search-submit")).toBeVisible();
  });
});
