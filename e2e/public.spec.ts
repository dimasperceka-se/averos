import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Averos/);
});

test("privacy page shows the published terms", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "PRIVACY POLICY" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Limitation of Liability" })).toBeVisible();
});

for (const path of ["/dashboard", "/checkout"]) {
  test(`signed-out visitors to ${path} are sent to log in`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=(%2F|/)${path.slice(1)}`));
  });
}
