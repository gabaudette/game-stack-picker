import { expect, test } from "@playwright/test";

test("copies a share link that restores the configuration over saved state", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async (text: string) => {
          sessionStorage.setItem("test-clipboard", text);
        },
      },
    });
  });
  await page.goto("/?v=1&picks=godot,blender&dimension=3d&platforms=desktop,mobile");
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByRole("status")).toContainText("Share link copied");
  const link = await page.evaluate(() => sessionStorage.getItem("test-clipboard"));
  if (!link) {
    throw new Error("No share link was copied.");
  }
  await page.getByRole("button", { name: "Remove Godot from stack" }).click();
  await page.goto(link);
  await expect(page.getByRole("button", { name: "Remove Godot", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Blender", exact: true })).toBeVisible();
  await expect(page.locator(".stack-meta")).toContainText("3D project");
});

test("reports malformed device data and starts with a usable empty stack", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("loadout.config.v1", "{");
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Could not restore");
  await page.getByRole("button", { name: "Select Godot", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Godot", exact: true })).toBeVisible();
});

test("shows an actionable PNG export failure and retains SVG export", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => null });
  });
  await page.goto("/?v=1&picks=godot");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Try the SVG download instead");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  expect((await download).suggestedFilename()).toBe("loadout-stack.svg");
});

test("loads every local logo without browser errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("img").evaluateAll((images) => {
    for (const image of images) {
      if (image instanceof HTMLImageElement) {
        image.loading = "eager";
      }
    }
  });
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  expect(errors).toEqual([]);
});
