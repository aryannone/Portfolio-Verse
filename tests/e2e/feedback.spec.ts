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

  test("a pinned note shows its badge and the owner's reply", async ({ page }) => {
    await page.route("**/api/feedback", (route) =>
      route.fulfill({ json: { notes: [{ ...approved[0], pinned: true, reply: "Thank you, Priya!" }], ready: true } }),
    );
    await page.goto("/");
    await page.locator("#feedback").scrollIntoViewIfNeeded();
    const note = page.locator(".fw-note.is-pinned");
    await expect(note.locator(".fw-pinned")).toHaveText("Pinned");
    await expect(note.locator(".fw-reply")).toHaveText("Reply: Thank you, Priya!");
  });

  test("admin: search, sort, pin, reply and approve all", async ({ page }) => {
    const notes = [
      { id: "00000001-aaaa-bbbb-cccc-dddddddddddd", name: "Priya", topic: "Templates", message: "Lovely templates here.", color: "#a8d8ff", font: "caveat", created_at: "2026-11-01T10:00:00Z", approved: true, pinned: false, reply: null },
      { id: "00000002-aaaa-bbbb-cccc-dddddddddddd", name: "Rahul", topic: "Editor", message: "The editor is quick.", color: "#ffe66d", font: "kalam", created_at: "2026-11-02T10:00:00Z", approved: false, pinned: false, reply: null },
      { id: "00000003-aaaa-bbbb-cccc-dddddddddddd", name: "Meera", topic: "Overall", message: "No sign-up is great.", color: "#ffb3c7", font: "indie", created_at: "2026-11-03T10:00:00Z", approved: false, pinned: false, reply: null },
    ];
    const actions: Record<string, unknown>[] = [];
    await page.route("**/api/feedback/admin", async (route) => {
      if (route.request().headers()["x-admin-key"] !== "test-admin-key-123") return route.fulfill({ status: 401, json: { error: "Wrong key." } });
      if (route.request().method() === "GET") return route.fulfill({ json: { notes } });
      actions.push(route.request().postDataJSON());
      return route.fulfill({ json: { ok: true } });
    });
    await page.goto("/admin/feedback");
    await page.getByLabel("Admin key").fill("test-admin-key-123");
    await page.getByRole("button", { name: "Open" }).click();

    // Waiting notes, newest first; then oldest first; then search.
    const names = page.locator(".fa-item .fw-name");
    await expect(names).toHaveText(["— Meera", "— Rahul"]);
    await page.getByLabel("Sort").selectOption("oldest");
    await expect(names).toHaveText(["— Rahul", "— Meera"]);
    await page.getByLabel("Search").fill("sign-up");
    await expect(names).toHaveText(["— Meera"]);
    await page.getByLabel("Search").fill("");

    // Pin and reply on the note already on the wall.
    await page.getByRole("button", { name: "On the wall" }).click();
    const priya = page.locator(".fa-item").filter({ hasText: "Priya" });
    await priya.getByRole("button", { name: "Pin" }).click();
    await expect(priya.locator(".fw-pinned")).toHaveText("Pinned");
    await priya.getByRole("button", { name: "Reply" }).click();
    await priya.getByLabel("Your reply (shown under the note)").fill("Thank you, Priya!");
    await priya.getByRole("button", { name: "Save reply" }).click();
    await expect(priya.locator(".fw-reply")).toHaveText("Reply: Thank you, Priya!");

    // Approve every waiting note at once.
    await page.getByRole("button", { name: /Waiting/ }).click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: "Approve all waiting (2)" }).click();
    await expect(page.locator(".fa-empty")).toHaveText("Nothing here.");
    await expect(page.getByRole("button", { name: "Waiting (0)" })).toBeVisible();

    expect(actions).toEqual([
      { id: notes[0].id, action: "pin" },
      { id: notes[0].id, action: "reply", reply: "Thank you, Priya!" },
      { action: "approve_all" },
    ]);
  });

  test("without Supabase the real API says the wall is not open, and admin needs the key", async ({ request }) => {
    const list = await request.get("/api/feedback");
    expect(await list.json()).toEqual({ notes: [], ready: false });
    expect((await request.post("/api/feedback", { data: {} })).status()).toBe(503);
    expect((await request.patch("/api/feedback", { data: {} })).status()).toBe(503);
    expect((await request.get("/api/feedback/admin")).status()).toBe(401);
  });
});
