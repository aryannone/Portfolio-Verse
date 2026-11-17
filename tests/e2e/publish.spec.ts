import { expect, test } from "@playwright/test";

// Publishing needs Supabase (sign-in and storage), which the tests do not have. These check what works without it.
test.describe("publishing", () => {
  test("an unpublished link shows a friendly not-found page", async ({ page }) => {
    const res = await page.goto("/u/nobody-here");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "This site is not published." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Make your own portfolio/ })).toHaveAttribute("href", "/");
  });

  test("the publish API needs a signed-in person", async ({ request }) => {
    expect(await (await request.get("/api/publish")).json()).toEqual({ signedIn: false });
    expect((await request.post("/api/publish")).status()).toBe(401);
    expect((await request.delete("/api/publish")).status()).toBe(401);
  });

  test("the editor has a Publish button, and sample content cannot be published", async ({ page }) => {
    await page.goto("/editor");
    await expect(page.locator(".ed-panel")).toBeVisible();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.locator(".ed-publish")).toContainText("This is still the sample content.");
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.locator(".ed-publish")).toHaveCount(0);
  });
});
