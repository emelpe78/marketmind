import { test, expect } from "@playwright/test";

test.describe("Flipping", () => {
  test("shows analysis form", async ({ page }) => {
    await page.goto("/flipping");
    await expect(
      page.getByRole("heading", { name: "Flipping-Kalkulator" }),
    ).toBeVisible();
    await expect(page.getByTestId("flip-input")).toBeVisible();
    await expect(page.getByTestId("flip-analyze")).toBeVisible();
    await expect(page.getByTestId("flip-analyze")).toContainText(
      "Flipping analysieren",
    );
  });

  test("shows flipping submenu and analyses page", async ({ page }) => {
    await page.goto("/flipping/analyses");
    await expect(
      page.getByRole("heading", { name: "Flipping-Analysen" }),
    ).toBeVisible();
    await expect(page.getByTestId("nav-flipping-calculator")).toBeVisible();
    await expect(page.getByTestId("nav-flipping-analyses")).toBeVisible();
  });
});
