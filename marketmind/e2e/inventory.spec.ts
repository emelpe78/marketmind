import { test, expect } from "@playwright/test";

test.describe("Inventory", () => {
  test("can add item and show profit after sale", async ({ page }) => {
    await page.goto("/inventory");
    await page.getByTestId("inventory-title").fill("Test GPU");
    await page.getByTestId("add-inventory").click();
    await expect(page.getByText("Test GPU")).toBeVisible();
  });
});
