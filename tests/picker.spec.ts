import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("manual selections replace engines, allow multiple tools, persist, and navigate", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Select Godot", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Godot", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "Select Unity", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select Godot", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Select Blueprints", exact: true }).click();
  await expect(
    page.getByText("A custom integration may be required.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove Unity", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove Blueprints from stack", exact: true }).click();
  await page.goBack();
  await expect(page.getByRole("button", { name: "Remove Blueprints", exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Remove Unity", exact: true })).toBeVisible();
});

test("restores a shared URL and reports malformed configuration", async ({ page }) => {
  await page.goto("/?v=99&picks=godot,missing,blender&dimension=3d&platforms=desktop,toaster");
  await expect(page.getByRole("button", { name: "Remove Godot", exact: true })).toBeVisible();
  await expect(page.getByRole("alert")).toContainText("Unknown tool");
  await expect(page.getByRole("alert")).toContainText("unsupported version");
  await expect(page.getByRole("button", { name: "Remove Blender", exact: true })).toBeVisible();
});

test("guided flow applies a stack only after replacement confirmation", async ({ page }) => {
  await page.goto("/?v=1&picks=godot");
  await page.getByRole("button", { name: "Help me choose" }).click();
  await page.getByRole("button", { name: "3D Models", exact: false }).click();
  const intermediateSteps = 7;
  for (let index = 0; index < intermediateSteps; index += 1) {
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await page.getByRole("button", { name: "Find my stack" }).click();
  await expect(
    page.getByRole("heading", { name: "A starting point for your next game." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use this stack" }).click();
  await expect(page.getByRole("dialog")).toContainText("Replace your current stack?");
  await page.getByRole("button", { name: "Replace stack", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Blender", exact: true })).toBeVisible();
  await expect(page).toHaveURL(/dimension=3d/);
});

test("search, filter, details, keyboard dismissal, and reset work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Search tools" }).fill("aseprite");
  await expect(page.getByRole("button", { name: "Select Aseprite", exact: true })).toBeVisible();
  await page.getByRole("checkbox", { name: "Free options" }).check();
  await expect(page.getByRole("heading", { name: "No tools found" })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("button", { name: "Details about Godot", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Console exports require");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Select Godot", exact: true }).click();
  await page.getByRole("button", { name: "Reset stack", exact: true }).click();
  await page.getByRole("button", { name: "Reset everything", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select Godot", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Select Godot", exact: true })).toBeVisible();
});

test("downloads valid standalone SVG and PNG diagrams", async ({ page }, testInfo) => {
  await page.goto("/?v=1&picks=godot,gdscript,blender&dimension=3d");
  const svgDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const svg = await svgDownload;
  const svgPath = testInfo.outputPath("stack.svg");
  await svg.saveAs(svgPath);
  const content = await readFile(svgPath, "utf8");
  expect(content).toContain("Godot");
  expect(content).toContain("data:image/svg+xml;base64,");
  const pngDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "PNG", exact: true }).click();
  const png = await pngDownload;
  const pngPath = testInfo.outputPath("stack.png");
  await png.saveAs(pngPath);
  const bytes = await readFile(pngPath);
  const minimumImageSize = 1000;
  expect(bytes.length).toBeGreaterThan(minimumImageSize);
  const signatureStart = 1;
  const signatureEnd = 4;
  expect(bytes.subarray(signatureStart, signatureEnd).toString()).toBe("PNG");
});

test("clipboard failures provide selectable prompt and share link", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => {
          throw new Error("Permission denied");
        },
      },
    });
  });
  await page.goto("/?v=1&picks=unity");
  await page.getByRole("button", { name: "Copy project prompt" }).click();
  await expect(page.getByRole("dialog")).toContainText("Permission denied");
  await expect(page.getByRole("textbox", { name: "Text to copy" })).toHaveValue(/Unity/);
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Copy share link" }).click();
  await expect(page.getByRole("textbox", { name: "Text to copy" })).toHaveValue(/picks=unity/);
});

test("reports storage failures while retaining URL configuration", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.goto("/?v=1&picks=godot");
  await expect(page.getByRole("alert")).toContainText("Storage blocked");
  await expect(page.getByRole("button", { name: "Remove Godot", exact: true })).toBeVisible();
});

test("keyboard navigation starts at the skip link and layout fits viewport", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to picker" })).toBeFocused();
  await page.keyboard.press("Enter");
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  expect(fits).toBe(true);
});
