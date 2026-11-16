import { expect, test, type Page } from "@playwright/test";

// The wall's server needs Supabase, which the tests do not have, so its answers are simulated here.
// The real API's behaviour without Supabase is checked at the end.
const approved = [
  { id: "00000001-aaaa-bbbb-cccc-dddddddddddd", name: "Priya", topic: "Templates", message: "The Aurora template is gorgeous!", color: "#a8d8ff", font: "caveat", created_at: "2026-11-01T10:00:00Z" },
];

async function openWall(page: Page, onPost?: (body: Record<string, unknown>) => void) {
  await page.route("**/api/feedback", async (route) => {
    if (route.request().method() === "GET") return route.fulfill({ json: { notes: approved, ready: true } });
    const body = route.request().postDataJSON();
    onPost?.(body);
    return route.fulfill({ status: 201, json: { note: { ...body, id: "ffffffff-1111-2222-3333-444444444444", created_at: new Date().toISOString() } } });
  });
  await page.goto("/");
  await page.locator("#feedback").scrollIntoViewIfNeeded();
  await expect(page.locator(".fw-note")).toHaveCount(1);
}

test.describe("feedback wall", () => {
  test("a note needs a name, then sticks to the wall, and only one per browser", async ({ page }) => {
    const posts: Record<string, unknown>[] = [];
    await openWall(page, (b) => posts.push(b));

    await page.getByLabel("Your feedback").fill("Click to edit in the preview, please!");
    await page.getByRole("button", { name: "Stick it on the wall" }).click();
    await expect(page.locator(".fw-error")).toHaveText("Please add your name at the bottom of the note.");
    expect(posts).toHaveLength(0);

    await page.locator(".fw-topic-pick select").selectOption("Editor");
    await page.getByLabel("Your name (required)").fill("Aryan");
    await page.getByRole("radio", { name: "Doodle" }).click();
    await page.getByRole("button", { name: "Stick it on the wall" }).click();

    await expect(page.locator(".fw-note.is-mine")).toContainText("Click to edit in the preview");
    await expect(page.locator(".fw-note.is-mine")).toContainText("Only you can see this until it is approved");
    await expect(page.locator(".fw-thanks")).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ name: "Aryan", topic: "Editor", font: "indie" });

    // After a reload this browser still sees its note, and cannot add another.
    await page.reload();
    await page.locator("#feedback").scrollIntoViewIfNeeded();
    await expect(page.locator(".fw-note.is-mine")).toBeVisible();
    await expect(page.locator(".fw-form")).toHaveCount(0);
  });

  test("a note can be dragged onto the wall by its tape", async ({ page }) => {
    await openWall(page);
    await page.getByLabel("Your feedback").fill("Dragging notes is fun!");
    await page.getByLabel("Your name (required)").fill("Meera");
    const tape = (await page.locator(".fw-tape").boundingBox())!;
    const board = (await page.locator(".fw-board").boundingBox())!;
    await page.mouse.move(tape.x + tape.width / 2, tape.y + tape.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(tape.x + ((board.x + 200 - tape.x) * i) / 10, tape.y + ((board.y + 150 - tape.y) * i) / 10);
    }
    await page.mouse.up();
    await expect(page.locator(".fw-note.is-mine")).toContainText("Dragging notes is fun!");
  });

  test("without Supabase the real API says the wall is not open, and admin needs the key", async ({ request }) => {
    const list = await request.get("/api/feedback");
    expect(await list.json()).toEqual({ notes: [], ready: false });
    expect((await request.post("/api/feedback", { data: {} })).status()).toBe(503);
    expect((await request.get("/api/feedback/admin")).status()).toBe(401);
  });
});
