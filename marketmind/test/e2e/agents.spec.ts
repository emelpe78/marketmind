import { test, expect } from "@playwright/test";

test.describe("Agents", () => {
  test("shows feature agents with usage info", async ({ page }) => {
    await page.goto("/agents/feature-agents");
    await expect(
      page.getByRole("heading", { name: "Feature-Agents" }),
    ).toBeVisible();
    await expect(page.getByText("Research Agent")).toBeVisible();
    await expect(page.getByTestId("agent-usage-research")).toBeVisible();
    await expect(
      page.getByTestId("agent-usage-research").getByRole("link", {
        name: "Preisrecherche",
      }),
    ).toBeVisible();
    await expect(
      page.getByTestId("agent-usage-strategy").getByRole("link", {
        name: "System-Prompt-Generator",
      }),
    ).toBeVisible();
    await expect(page.getByTestId("meta-agent-badge")).toBeVisible();
    await expect(page.getByTestId("edit-agent")).toHaveCount(3);
  });

  test("shows prompt generator page", async ({ page }) => {
    await page.goto("/agents/prompt-generator");
    await expect(
      page.getByRole("heading", { name: "System-Prompt-Generator" }),
    ).toBeVisible();
    await expect(page.getByTestId("prompt-description")).toBeVisible();
  });

  test("redirects /agents to feature agents", async ({ page }) => {
    await page.goto("/agents");
    await expect(page).toHaveURL(/\/agents\/feature-agents$/);
  });

  test("expands agents submenu in sidebar", async ({ page }) => {
    await page.goto("/agents/feature-agents");
    await expect(page.getByTestId("nav-agents-feature")).toBeVisible();
    await expect(page.getByTestId("nav-agents-prompt-generator")).toBeVisible();
    await expect(page.getByTestId("nav-agents-history")).toBeVisible();
  });
});
