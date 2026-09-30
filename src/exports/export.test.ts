import { describe, expect, it } from "vitest";
import { CONFIG_VERSION, defaultAnswers } from "../domain/answers";
import type { StackConfig } from "../domain/types";
import { emptyConfig } from "../state/config";
import { buildDiagram, escapeXml } from "./diagram";
import { buildPrompt } from "./export";

const config: StackConfig = {
  version: CONFIG_VERSION,
  picks: ["unity", "blueprints"],
  answers: { ...defaultAnswers, multiplayer: "online", art: "stylized" },
};

describe("project exports", () => {
  it("includes the project brief, official links, and compatibility notes", () => {
    const prompt = buildPrompt(config);
    expect(prompt).toContain("Multiplayer: online");
    expect(prompt).toContain("Art style: stylized");
    expect(prompt).toContain("https://unity.com/");
    expect(prompt).toContain("custom integration");
    expect(prompt).toContain("Blueprints");
  });
  it("exports an incomplete stack honestly", () => {
    expect(buildPrompt(emptyConfig)).toContain("No tools selected yet");
    expect(buildDiagram(emptyConfig).svg).toContain("0 tools selected");
  });
  it("creates a standalone diagram with embedded logos and warnings", () => {
    const diagram = buildDiagram(config);
    expect(diagram.svg).toContain("data:image/svg+xml;base64,");
    expect(diagram.svg).toContain("Unity");
    expect(diagram.svg).toContain("custom integration");
    expect(diagram.svg).toContain("Art: stylized");
    expect(diagram.svg).not.toContain('href="https://');
    expect(diagram.height).toBeGreaterThan(buildDiagram(emptyConfig).height);
    const document = new DOMParser().parseFromString(diagram.svg, "image/svg+xml");
    expect(document.querySelector("parsererror")).toBeNull();
  });
  it("escapes XML special characters", () => {
    expect(escapeXml('<tool name="A&B">')).toBe("&lt;tool name=&quot;A&amp;B&quot;&gt;");
  });
});
