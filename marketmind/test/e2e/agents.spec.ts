import { test, expect } from "@playwright/test";

test.describe("Agents", () => {
  test("shows agent list and prompt generator", async ({ page }) => {
    await page.goto("/agents");
    await expect(
      page.getByRole("heading", { name: "Agent-Manager" }),
    ).toBeVisible();
    await expect(page.getByText("Research Agent")).toBeVisible();
    await expect(page.getByTestId("prompt-description")).toBeVisible();
  });
});
