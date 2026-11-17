import { expect, test } from "@playwright/test";

test.describe("site pages", () => {
  test("landing page shows the hero, the four steps and the templates", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Your portfolio");
    const steps = page.getByRole("heading", { name: "Four steps. That is all." });
    await steps.scrollIntoViewIfNeeded();
    await expect(steps).toBeVisible();
    await expect(page.locator(".how-steps .step")).toHaveCount(4);
    await page.locator("#templates").scrollIntoViewIfNeeded();
    await expect(page.locator("#templates .tg-card").first()).toBeVisible();
  });

  test("every landing section appears as it is scrolled to", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/");
    await page.mouse.click(10, 10);
    for (let i = 0; i < 40; i++) {
      await page.mouse.wheel(0, 250);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(1200);
    const reveals = page.locator("[data-reveal]");
    const count = await reveals.count();
    expect(count).toBeGreaterThan(5);
    await expect(page.locator("[data-reveal].is-in")).toHaveCount(count);
    for (const id of ["#templates", "#features"]) {
      const box = await page.locator(id).boundingBox();
      expect(box && box.height).toBeGreaterThan(200);
    }
    await context.close();
  });

  test("the opening animation plays on load and a tap skips it", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator(".intro")).toBeVisible();
    await page.mouse.click(10, 10);
    await expect(page.locator(".intro")).toBeHidden({ timeout: 2_000 });
    await context.close();
  });

  test("the four steps advance on their own and can be picked", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await context.newPage();
    await page.goto("/");
    await page.mouse.click(10, 10);
    await page.locator(".how").scrollIntoViewIfNeeded();
    await page.mouse.move(5, 5);
    const active = page.locator(".how-steps .step.is-active .step-title");
    await expect(active).toHaveText("Start building");
    await expect(active).toHaveText("Fill in your details", { timeout: 6_000 });
    await page.locator(".how-pick").nth(3).click();
    await expect(active).toHaveText("Publish or download");
    await context.close();
  });

  test("privacy page is real, and removed pages are gone", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy", level: 1 })).toBeVisible();
    await expect(page.getByText("your portfolio stays in your browser")).toBeVisible();
    for (const path of ["/terms", "/report"]) expect((await page.request.get(path)).status()).toBe(404);
  });

  test("shared links get a preview image", async ({ page, request }) => {
    await page.goto("/");
    const image = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(image).toContain("/opengraph-image");
    const res = await request.get("/opengraph-image");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  });
});
