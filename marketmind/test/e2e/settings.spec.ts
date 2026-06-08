import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("renders settings form and toggles theme", async ({ page }) => {
    await page.goto("/settings");

    await expect(
      page.getByRole("heading", { name: "Einstellungen" }),
    ).toBeVisible();
    await expect(page.getByTestId("scraper-delay-min")).toBeVisible();
    await expect(page.getByTestId("ai-provider-tabs")).toBeVisible();
    await expect(page.getByTestId("openrouter-key")).toBeVisible();

    const html = page.locator("html");
    const wasDark = await html.evaluate((el) => el.classList.contains("dark"));

    await page.getByTestId("theme-toggle").click();
    await page.waitForTimeout(300);

    const isDark = await html.evaluate((el) => el.classList.contains("dark"));
    expect(isDark).toBe(!wasDark);
  });
});
