import { test, expect } from "@playwright/test";

const pages = [
  { path: "/", heading: "Letzte Suchen" },
  {
    path: "/research",
    heading: "Preisrecherche",
    navTestId: "nav-research-run",
    navToggleTestId: "nav-research-toggle",
  },
  {
    path: "/research/saved",
    heading: "Gespeicherte Recherchen",
    navTestId: "nav-research-saved",
    navToggleTestId: "nav-research-toggle",
  },
  {
    path: "/listings",
    heading: "Anzeigen-Generator",
    navTestId: "nav-listings-generator",
    navToggleTestId: "nav-listings-toggle",
  },
  { path: "/flipping", heading: "Flipping-Kalkulator" },
  { path: "/watchlist", heading: "Watchlist" },
  { path: "/inventory", heading: "Inventar" },
  {
    path: "/agents/feature-agents",
    heading: "Feature-Agents",
    navTestId: "nav-agents-feature",
  },
  { path: "/settings", heading: "Einstellungen" },
];

test.describe("Dashboard & Navigation", () => {
  test("dashboard loads with KPI cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Gespeicherte Recherchen")).toBeVisible();
    await expect(page.getByText("Watchlist-Alerts")).toBeVisible();
    await expect(page.getByTestId("saved-researches")).not.toBeVisible();
  });

  test("shows ai setup hint when provider is not configured", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("ai-setup-hint")).toBeVisible();
    await expect(page.getByText("KI-Provider konfigurieren")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Zu den Einstellungen" }),
    ).toBeVisible();
  });

  for (const { path, heading, navTestId, navToggleTestId } of pages.slice(1)) {
    test(`navigates to ${path}`, async ({ page }) => {
      await page.goto("/");
      if (navTestId) {
        if (navToggleTestId) {
          await page.getByTestId(navToggleTestId).click();
        } else {
          await page.getByTestId("nav-agents-toggle").click();
        }
        await page.getByTestId(navTestId).click();
      } else {
        await page
          .getByRole("link", { name: new RegExp(heading.split("-")[0]!, "i") })
          .first()
          .click();
      }
      await expect(page).toHaveURL(
        new RegExp(path.replace("/", "\\/") + "(\\/)?$"),
      );
    });
  }
});
