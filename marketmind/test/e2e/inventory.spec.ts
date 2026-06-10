import { test, expect } from "@playwright/test";

test.describe("Inventory", () => {
  test("can add item and show profit after sale", async ({ page }) => {
    await page.goto("/inventory");
    await page.getByTestId("add-inventory").click();
    const uniqueTitle = `E2E GPU ${Date.now()}`;
    await page.getByTestId("inventory-create-title").fill(uniqueTitle);
    await page.getByTestId("inventory-create-buy-price").fill("100");
    await page.getByTestId("confirm-inventory-create").click();
    const inventoryList = page.getByTestId("inventory-list");
    const itemRow = inventoryList
      .locator("div.rounded-lg")
      .filter({ hasText: uniqueTitle });
    await expect(itemRow).toBeVisible();
    await expect(itemRow.getByText("Einkauf: Kleinanzeigen")).toBeVisible();

    await itemRow.getByTestId("mark-sold").click();
    await page.getByTestId("sell-price").fill("180");
    await page
      .getByTestId("sell-platform")
      .getByRole("button", { name: "eBay" })
      .click();
    await page.getByTestId("confirm-sell").click();
    await expect(itemRow.getByText("Verkauft", { exact: true })).toBeVisible();
    await expect(itemRow.getByText("180,00 €")).toBeVisible();
    await expect(itemRow.getByText("Verkauf: eBay")).toBeVisible();
    await expect(itemRow.getByText("(+80,00 €)")).toBeVisible();

    await itemRow.getByTestId("edit-inventory").click();
    const editedTitle = `${uniqueTitle} bearbeitet`;
    await page.getByTestId("edit-inventory-title").fill(editedTitle);
    await page.getByTestId("edit-inventory-sell-price").fill("200");
    await page.getByTestId("confirm-edit-inventory").click();
    const editedRow = inventoryList
      .locator("div.rounded-lg")
      .filter({ hasText: editedTitle });
    await expect(editedRow).toBeVisible();
    await expect(editedRow.getByText("200,00 €")).toBeVisible();
    await expect(editedRow.getByText("(+100,00 €)")).toBeVisible();
  });
});
