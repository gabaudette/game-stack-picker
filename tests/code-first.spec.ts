import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("restores and exports a raylib and Odin configuration", async ({ page }, testInfo) => {
  await page.goto("/?v=1&picks=raylib,odin,odin-test&dimension=2d&platforms=desktop");
  await expect(page.getByRole("button", { name: "Remove raylib", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Odin", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove Odin", exact: true })).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "SVG", exact: true }).click();
  const path = testInfo.outputPath("odin-stack.svg");
  await (await download).saveAs(path);
  const content = await readFile(path, "utf8");
  expect(content).toContain("raylib");
  expect(content).toContain("Odin");
  expect(content).toContain("data:image/svg+xml;base64,");
});

test("guided SFML stack includes its native language and build tools", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Help me choose" }).click();
  const intermediateSteps = 7;
  for (let index = 0; index < intermediateSteps; index += 1) {
    await page.getByRole("button", { name: "Continue", exact: true }).click();
  }
  await page.getByRole("button", { name: "SFML", exact: false }).click();
  await page.getByRole("button", { name: "Find my stack" }).click();
  await expect(page.locator(".recommendation-results")).toContainText("CMake");
  await page.getByRole("button", { name: "Use this stack" }).click();
  await expect(page.getByRole("button", { name: "Remove SFML", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove C++", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove CMake", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Catch2", exact: true })).toBeVisible();
});

test("raylib mobile configurations explain the Android-only verified route", async ({ page }) => {
  await page.goto("/?v=1&picks=raylib,c&dimension=2d&platforms=mobile");
  await expect(page.getByText("iOS", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Details about raylib", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("Android");
});
