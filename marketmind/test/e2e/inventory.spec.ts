import { test, expect } from "@playwright/test";

test.describe("Inventory", () => {
  test("can add item and show profit after sale", async ({ page }) => {
    await page.goto("/inventory");
    await page.getByTestId("inventory-title").fill("Test GPU");
    await page.getByLabel("Einkaufspreis (€)").fill("100");
    await page.getByTestId("add-inventory").click();
    await expect(page.getByText("Test GPU")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Kleinanzeigen" }),
    ).toBeVisible();

    await page.getByTestId("mark-sold").click();
    await page.getByTestId("sell-price").fill("180");
    await page
      .getByTestId("sell-platform")
      .getByRole("button", { name: "eBay" })
      .click();
    await page.getByTestId("confirm-sell").click();
    await expect(page.getByText("verkauft")).toBeVisible();
    await expect(page.getByText("180,00 €")).toBeVisible();
    await expect(page.getByText("eBay")).toBeVisible();
    await expect(page.getByTestId("total-profit")).toContainText("80,00 €");
  });
});
