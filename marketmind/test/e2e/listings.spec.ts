import { test, expect } from "@playwright/test";

test.describe("Listings", () => {
  test("shows tabs and generate form", async ({ page }) => {
    await page.goto("/listings");
    await expect(
      page.getByRole("heading", { name: "Anzeigen-Generator" }),
    ).toBeVisible();
    await expect(page.getByTestId("listing-query")).toBeVisible();
    await expect(page.getByTestId("generate-listing")).toBeVisible();
  });

  test("shows saved listings page", async ({ page }) => {
    await page.goto("/listings/saved");
    await expect(
      page.getByRole("heading", { name: "Gespeicherte Anzeigen" }),
    ).toBeVisible();
    await expect(page.getByTestId("saved-listings-empty")).toBeVisible();
  });
});
