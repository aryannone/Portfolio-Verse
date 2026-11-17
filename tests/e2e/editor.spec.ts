import { readFileSync, writeFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const NAME = "Test Person";

async function openEditor(page: Page) {
  await page.goto("/editor");
  await expect(page.locator(".ed-panel")).toBeVisible();
}

const nameField = (page: Page) => page.locator(".ed-group", { hasText: "About you" }).first().getByLabel("Name", { exact: true });

test.describe("editor", () => {
  test("typing a name shows it in the preview, and it is kept after a reload", async ({ page }) => {
    await openEditor(page);
    await nameField(page).fill(NAME);
    await expect(page.locator(".tp").getByText(NAME).first()).toBeVisible();
    await page.waitForTimeout(800); // autosave
    await page.reload();
    await expect(nameField(page)).toHaveValue(NAME);
  });

  test("Download HTML gives one self-contained file with the details in it", async ({ page }, info) => {
    await openEditor(page);
    await nameField(page).fill(NAME);
    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download HTML" }).click()]);
    const path = info.outputPath("portfolio.html");
    await download.saveAs(path);
    const html = readFileSync(path, "utf8");
    expect(html).toContain(NAME);
    expect(html).toContain("<style>");
    expect(html).not.toContain("/_next/"); // nothing from the site itself is needed

    // The file works on its own: it opens without errors and its section bar is there.
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("about:blank");
    await page.setContent(html);
    await expect(page.locator(".tp").getByText(NAME).first()).toBeVisible();
    await expect(page.locator(".tp-nav")).toBeVisible();
    // It ends with a small credit line linking to PORTFOLIO-VERSE.
    const credit = page.locator(".tp > .pv-credit");
    await expect(credit).toHaveText("Made in • PORTFOLIO-VERSE");
    await expect(credit).toHaveAttribute("href", "https://portfolio-verse-tau.vercel.app");
    expect(await page.locator(".tp > *").last().getAttribute("class")).toBe("pv-credit");
    expect(errors).toEqual([]);
  });

  test("photos: a JPG is added, other formats are turned away with a message", async ({ page }, info) => {
    await openEditor(page);
    const about = page.locator(".ed-group", { hasText: "About you" }).first();
    const input = about.locator(".ed-photos input[type=file]").first();

    const notPicture = info.outputPath("notes.heic");
    writeFileSync(notPicture, "not a picture");
    await input.setInputFiles(notPicture);
    await expect(page.getByText("Please add a JPG or PNG photo.").first()).toBeVisible();

    // A tiny real JPG, made in the page.
    const jpg = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 40;
      c.height = 40;
      c.getContext("2d")!.fillRect(0, 0, 40, 40);
      return c.toDataURL("image/jpeg").split(",")[1];
    });
    const jpgPath = info.outputPath("me.jpg");
    writeFileSync(jpgPath, Buffer.from(jpg, "base64"));
    await input.setInputFiles(jpgPath);
    await expect(page.locator(".tp-avatar img")).toHaveCount(1);
    await expect(page.locator(".tp-avatar img")).toHaveJSProperty("complete", true);
  });

  test("entry photos show whole with a blurred fill, and can be zoomed in, out and moved", async ({ page }) => {
    await openEditor(page);
    const shot = page.locator(".tp .tp-shot").first();
    const photo = shot.locator("img.tp-photo");
    await expect(shot.locator("img.tp-photo-bg")).toHaveCount(1);
    await expect(photo).toHaveCSS("object-fit", "contain");

    await page.getByRole("button", { name: "Crop and zoom" }).first().click();
    const stage = page.getByRole("application", { name: /Photo crop/ });
    await expect(stage).toBeVisible();
    // Zoom in twice with the button, then move the photo with the keyboard.
    await page.getByRole("button", { name: "Zoom in" }).click();
    await page.getByRole("button", { name: "Zoom in" }).click();
    await stage.focus();
    await page.keyboard.press("ArrowRight");
    await expect(shot).toHaveAttribute("style", /--tp-z: 1.2/);
    await expect(shot).toHaveAttribute("style", /--tp-tx: 2%/);
    // Zoom out below the frame: the blurred copy still fills the space around the photo.
    await page.getByLabel("Zoom", { exact: true }).fill("0.6");
    await expect(shot).toHaveAttribute("style", /--tp-z: 0.6/);
    await expect(shot.locator("img.tp-photo-bg")).toHaveCount(1);
    // Dragging moves it too.
    const box = (await stage.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 - box.width / 4, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();
    await expect(shot).toHaveAttribute("style", /--tp-tx: -2[0-9.]*%/);

    await page.getByRole("button", { name: "Done" }).click();
    await page.getByRole("button", { name: "Show the whole photo again" }).first().click();
    await expect(shot).not.toHaveAttribute("style", /--tp-z/);
  });

  test("large photos are made smaller in the downloaded file", async ({ page }, info) => {
    await openEditor(page);
    // A 3000 x 2000 photo full of noise, which stays large as a JPG (several MB).
    const big = await page.evaluate(() => {
      const c = document.createElement("canvas");
      c.width = 3000;
      c.height = 2000;
      const ctx = c.getContext("2d")!;
      const data = ctx.createImageData(3000, 2000);
      for (let i = 0; i < data.data.length; i++) data.data[i] = (i * 2654435761) % 251;
      ctx.putImageData(data, 0, 0);
      return c.toDataURL("image/jpeg", 0.95).split(",")[1];
    });
    const bigPath = info.outputPath("big.jpg");
    writeFileSync(bigPath, Buffer.from(big, "base64"));
    const about = page.locator(".ed-group", { hasText: "About you" }).first();
    await about.locator(".ed-photos input[type=file]").first().setInputFiles(bigPath);
    await expect(page.locator(".tp-avatar img")).toHaveCount(1);

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Download HTML" }).click()]);
    const path = info.outputPath("portfolio.html");
    await download.saveAs(path);
    const html = readFileSync(path, "utf8");
    expect(html.length).toBeLessThan(big.length / 2);
    expect(html).toContain("data:image/webp");
  });

  // The title is plain ASCII on purpose: Playwright cannot hand the page a file from an output folder
  // whose path has accented letters, and the folder is named after the test.
  test("resume round trip: the resume PDF it makes can be imported back", async ({ page }, info) => {
    await openEditor(page);
    await nameField(page).fill(NAME);
    const about = page.locator(".ed-group", { hasText: "About you" }).first();
    await about.getByLabel("Email", { exact: true }).fill("test.person@example.com");
    await page.waitForTimeout(600);

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Résumé PDF", exact: true }).click()]);
    const pdf = info.outputPath("resume.pdf");
    await download.saveAs(pdf);

    // Change the name, then import the PDF: the details come back from the file.
    await nameField(page).fill("Someone Else");
    await page.waitForTimeout(800); // let the editor finish saving the edit, as it would for a person
    await page.getByLabel("Fill in from a résumé PDF").setInputFiles(pdf);
    await expect(nameField(page)).toHaveValue(NAME, { timeout: 15_000 });
    await expect(about.getByLabel("Email", { exact: true })).toHaveValue("test.person@example.com");
  });

  test("Save a copy adds a second portfolio to My portfolios", async ({ page }) => {
    await openEditor(page);
    await nameField(page).fill(NAME);
    await page.waitForTimeout(600);
    page.once("dialog", (d) => d.accept("Copy for the test"));
    await page.getByRole("button", { name: "Save a copy" }).click();
    await expect(page.getByText("Copy saved to My portfolios")).toBeVisible();
    await page.goto("/saved");
    await expect(page.getByText("Copy for the test")).toBeVisible();
    await expect(page.locator("article.tcard")).toHaveCount(2);
  });
});
