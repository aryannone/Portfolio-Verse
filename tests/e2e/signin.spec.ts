import { expect, test } from "@playwright/test";

// The tests run without Supabase, so sign-in is off: every page stays open, and the header has no account button.
// With Supabase set (in Vercel), middleware.ts sends people who are not signed in from the building pages to /signin.
test.describe("sign-in (not set up in tests)", () => {
  test("the sign-in page offers Google and explains what is shared", async ({ page }) => {
    await page.goto("/signin?next=/editor");
    await expect(page.getByRole("heading", { name: "Sign in to start building." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with Google" })).toBeVisible();
    await page.getByRole("button", { name: "Continue with Google" }).click();
    await expect(page.locator(".fw-error")).toHaveText("Sign-in is not set up on this copy of the site.");
  });

  test("building pages stay open and the header has no account button", async ({ page }) => {
    await page.goto("/start");
    await expect(page).toHaveURL(/\/start$/);
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  });
});
