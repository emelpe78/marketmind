import { test, expect } from "@playwright/test";

test.describe("Flipping", () => {
  test("calculates margin live", async ({ page }) => {
    await page.goto("/flipping");
    await expect(
      page.getByRole("heading", { name: "Flipping-Kalkulator" }),
    ).toBeVisible();
    await expect(page.getByTestId("flip-result")).toBeVisible();
    await expect(page.getByTestId("flip-score")).toContainText(
      "Sehr lohnenswert",
    );
  });
});
