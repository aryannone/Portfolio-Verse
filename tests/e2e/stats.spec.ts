import { expect, test } from "@playwright/test";

// The home page's numbers. The server needs Supabase, which the tests do not have, so its answers are simulated.
test.describe("home page numbers", () => {
  test("shows the counted numbers, and this browser checks in once a day", async ({ page }) => {
    const events: string[] = [];
    await page.route("**/api/stats", (route) => {
      if (route.request().method() === "POST") {
        events.push(route.request().postDataJSON().event);
        // Checking in answers with the up-to-date number, which already includes this browser.
        return route.fulfill({ json: { ok: true, visitors: 1241 } });
      }
      return route.fulfill({ json: { ready: true, visitors: 1240, downloads: 1, notes: 12 } });
    });
    await page.goto("/");
    const stats = page.getByRole("list", { name: "PORTFOLIO-VERSE in numbers" });
    // The fresh number from checking in, not the cached 1240.
    await expect(stats).toContainText("1,241visitors");
    await expect(stats).toContainText("1portfolio downloaded");
    await expect(stats).toContainText("12feedback notes");
    expect(events).toEqual(["visit"]);

    await page.reload();
    await expect(stats).toContainText("1,240visitors");
    expect(events).toEqual(["visit"]);
  });

  test("shows nothing when counting is not set up, and the real API says so", async ({ page, request }) => {
    expect(await (await request.get("/api/stats")).json()).toEqual({ ready: false });
    expect((await request.post("/api/stats", { data: { event: "visit" } })).status()).toBe(503);
    await page.goto("/");
    await expect(page.locator(".hero h1")).toBeVisible();
    await expect(page.locator(".stats")).toHaveCount(0);
  });
});
