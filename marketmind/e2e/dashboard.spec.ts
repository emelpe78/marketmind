import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", heading: "Letzte Suchen" },
  { path: "/research", heading: "Preisrecherche" },
  { path: "/listings", heading: "Anzeigen-Generator" },
  { path: "/flipping", heading: "Flipping-Kalkulator" },
  { path: "/watchlist", heading: "Watchlist" },
  { path: "/inventory", heading: "Inventar" },
  { path: "/agents", heading: "Agent-Manager" },
  { path: "/settings", heading: "Einstellungen" },
];

test.describe("Dashboard & Navigation", () => {
  test("dashboard loads with KPI cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Letzte Suchen")).toBeVisible();
    await expect(page.getByText("Watchlist-Alerts")).toBeVisible();
  });

  for (const { path, heading } of pages.slice(1)) {
    test(`navigates to ${path}`, async ({ page }) => {
      await page.goto("/");
      await page
        .getByRole("link", { name: new RegExp(heading.split("-")[0], "i") })
        .first()
        .click();
      await expect(page).toHaveURL(
        new RegExp(path.replace("/", "\\/") + "(\\/)?$"),
      );
    });
  }
});
