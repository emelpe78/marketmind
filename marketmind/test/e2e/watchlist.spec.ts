import { test, expect } from "@playwright/test";

test.describe("Watchlist", () => {
  test("can add watchlist item", async ({ page }) => {
    await page.goto("/watchlist");
    await page.getByTestId("watchlist-title").fill("RTX 3060 Test");
    await page.getByTestId("add-watchlist").click();
    await expect(page.getByText("RTX 3060 Test")).toBeVisible();
  });

  test("can edit watchlist item in modal", async ({ page }) => {
    await page.goto("/watchlist");
    await page.getByTestId("watchlist-title").fill("GPU zum Bearbeiten");
    await page
      .getByLabel("URL")
      .fill("https://www.kleinanzeigen.de/s-anzeige/test/123");
    await page.getByTestId("add-watchlist").click();
    await expect(page.getByText("GPU zum Bearbeiten")).toBeVisible();

    const titleLink = page.getByTestId("watchlist-title-link").first();
    await expect(titleLink).toHaveAttribute(
      "href",
      "https://www.kleinanzeigen.de/s-anzeige/test/123",
    );
    await expect(titleLink).toHaveAttribute("target", "_blank");
    await expect(page.getByTestId("watchlist-platform").first()).toHaveText(
      "Kleinanzeigen",
    );

    await page.getByTestId("edit-watchlist").first().click();
    await page.getByTestId("edit-watchlist-title").fill("GPU bearbeitet");
    await page.getByTestId("edit-watchlist-target-price").fill("150");
    await page.getByTestId("confirm-edit-watchlist").click();

    await expect(page.getByText("GPU bearbeitet")).toBeVisible();
    await expect(page.getByText("Ziel: 150,00 €")).toBeVisible();
  });

  test("delete requires confirmation", async ({ page }) => {
    await page.goto("/watchlist");
    await page.getByTestId("watchlist-title").fill("GPU zum Löschen");
    await page.getByTestId("add-watchlist").click();
    await expect(page.getByText("GPU zum Löschen")).toBeVisible();

    await page.getByTestId("delete-watchlist").first().click();
    await expect(page.getByText("Eintrag löschen?")).toBeVisible();
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await expect(page.getByText("GPU zum Löschen")).toBeVisible();

    await page.getByTestId("delete-watchlist").first().click();
    await page.getByTestId("confirm-delete-watchlist").click();
    await expect(page.getByText("Eintrag löschen?")).not.toBeVisible();
    await expect(
      page.getByRole("heading", { name: "GPU zum Löschen", exact: true }),
    ).not.toBeVisible();
  });
});
