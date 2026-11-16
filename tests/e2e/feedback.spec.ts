import { expect, test, type Page } from "@playwright/test";

// The wall's server needs Supabase, which the tests do not have, so its answers are simulated here.
// The real API's behaviour without Supabase is checked at the end.
const approved = [
  { id: "00000001-aaaa-bbbb-cccc-dddddddddddd", name: "Priya", topic: "Templates", message: "The Aurora template is gorgeous!", color: "#a8d8ff", font: "caveat", created_at: "2026-11-01T10:00:00Z" },
];

async function openWall(page: Page, onPost?: (body: Record<string, unknown>, method: string) => void) {
  await page.route("**/api/feedback", async (route) => {
    const method = route.request().method();
    if (method === "GET") return route.fulfill({ json: { notes: approved, ready: true } });
    const body = route.request().postDataJSON();
    onPost?.(body, method);
    const note = { ...body, id: "ffffffff-1111-2222-3333-444444444444", created_at: new Date().toISOString() };
    return route.fulfill({ status: method === "POST" ? 201 : 200, json: { note } });
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
    await expect(page.locator(".fw-note.is-mine")).not.toContainText("approved");
    await expect(page.locator(".fw-thanks")).toBeVisible();
    expect(posts).toHaveLength(1);
    expect(posts[0]).toMatchObject({ name: "Aryan", topic: "Editor", font: "indie" });

    // After a reload this browser still sees its note, and cannot add another.
    await page.reload();
    await page.locator("#feedback").scrollIntoViewIfNeeded();
    await expect(page.locator(".fw-note.is-mine")).toBeVisible();
    await expect(page.locator(".fw-form")).toHaveCount(0);
  });

  test("the visitor can change the words and the style of their note", async ({ page }) => {
    const sent: { body: Record<string, unknown>; method: string }[] = [];
    await openWall(page, (body, method) => sent.push({ body, method }));
    await page.getByLabel("Your feedback").fill("First thoughts on the editor.");
    await page.getByLabel("Your name (required)").fill("Aryan");
    await page.getByRole("button", { name: "Stick it on the wall" }).click();
    await expect(page.locator(".fw-note.is-mine")).toContainText("First thoughts");

    await page.getByRole("button", { name: "Edit your note" }).click();
    await expect(page.getByLabel("Your feedback")).toHaveValue("First thoughts on the editor.");
    await page.getByLabel("Your feedback").fill("Changed my mind: the editor is great!");
    await page.getByRole("radio", { name: "Note colour 3" }).click();
    await page.getByRole("radio", { name: "Neat" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();

    const mineNote = page.locator(".fw-note.is-mine");
    await expect(mineNote).toContainText("Changed my mind");
    await expect(page.locator(".fw-note")).toHaveCount(2);
    expect(sent.map((s) => s.method)).toEqual(["POST", "PATCH"]);
    expect(sent[1].body).toMatchObject({ message: "Changed my mind: the editor is great!", color: "#a5f3c4", font: "patrick" });

    // The change is kept after a reload, and the note can still be edited.
    await page.reload();
    await page.locator("#feedback").scrollIntoViewIfNeeded();
    await expect(page.locator(".fw-note.is-mine")).toContainText("Changed my mind");
    await expect(page.getByRole("button", { name: "Edit your note" })).toBeVisible();
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
    expect((await request.patch("/api/feedback", { data: {} })).status()).toBe(503);
    expect((await request.get("/api/feedback/admin")).status()).toBe(401);
  });
});
