import { describe, expect, it } from "vitest";
import { defaultAnswers } from "./answers";
import { toolById, tools } from "./catalog";
import { compatibilityWarnings } from "./compatibility";
import { recommend } from "./recommend";
import type { Answers } from "./types";

const project = (overrides: Partial<Answers> = {}): Answers => ({
  ...defaultAnswers,
  platforms: [...defaultAnswers.platforms],
  ...overrides,
});

describe("curated recommendations", () => {
  it("gives a beginner a no-cost 2D starting point without online services", () => {
    const result = recommend(project());
    expect(result.engine?.id).toBe("godot");
    expect(result.picks).toContain("gdscript");
    expect(result.picks).toContain("krita");
    expect(result.picks).not.toContain("nakama");
    expect(result.picks).not.toContain("godot-multiplayer");
    expect(result.notices.join(" ")).toContain("costs");
  });
  it("chooses Godot for an experienced indie 3D team", () => {
    const result = recommend(
      project({ dimension: "3d", experience: "intermediate", art: "stylized", team: "small" }),
    );
    expect(result.engine?.id).toBe("godot");
    expect(result.picks).toContain("blender");
    expect(result.picks).toContain("blender-animation");
    expect(result.picks).toContain("gut");
  });
  it("supports a studio multiplayer pipeline", () => {
    const result = recommend(
      project({
        dimension: "3d",
        team: "studio",
        experience: "advanced",
        budget: "professional",
        art: "realistic",
        multiplayer: "online",
      }),
    );
    expect(result.engine?.id).toBe("unreal");
    expect(result.picks).toEqual(
      expect.arrayContaining([
        "cpp",
        "blueprints",
        "unreal-replication",
        "nakama",
        "perforce",
        "fmod",
        "substance",
      ]),
    );
  });
  it("chooses a browser-first framework for a 2D browser project", () => {
    const result = recommend(project({ platforms: ["web"], experience: "intermediate" }));
    expect(result.engine?.id).toBe("phaser");
    expect(result.picks).toEqual(expect.arrayContaining(["typescript", "playwright", "itch"]));
    expect(result.picks).not.toContain("steam");
  });
  it("includes both mobile stores and their enrollment caveat", () => {
    const result = recommend(project({ platforms: ["mobile"], dimension: "3d", art: "stylized" }));
    expect(result.picks).toEqual(expect.arrayContaining(["google-play", "app-store"]));
    expect(result.notices.join(" ")).toContain("store enrollment");
  });
  it("keeps an explicit engine and reports a platform conflict", () => {
    const result = recommend(project({ preferredEngine: "unreal", platforms: ["web"] }));
    expect(result.engine?.id).toBe("unreal");
    expect(result.notices.join(" ")).toContain("no direct web export");
  });
  it("omits online services for local multiplayer", () => {
    const result = recommend(project({ multiplayer: "local" }));
    expect(
      result.picks.some((id) => ["network", "backend"].includes(toolById.get(id)?.category ?? "")),
    ).toBe(false);
  });
  it("explains when no cataloged engine supports all targets", () => {
    const result = recommend(project({ dimension: "3d", platforms: ["web", "console"] }));
    expect(result.engine?.id).toBe("unity");
    expect(result.notices.join(" ")).toContain("Console SDKs");
  });
  it("reports a missing preferred engine without silently choosing one", () => {
    const result = recommend(project({ preferredEngine: "missing" }));
    expect(result.engine).toBeUndefined();
    expect(result.picks).toEqual([]);
    expect(result.notices.join(" ")).toContain("no longer in the catalog");
  });
  it("is deterministic and every suggested tool has a reason", () => {
    const answers = project({ multiplayer: "online", preferredEngine: "unity" });
    const result = recommend(answers);
    expect(result).toEqual(recommend(answers));
    for (const id of result.picks) {
      expect(toolById.has(id)).toBe(true);
      expect(result.reasons.get(id)).toBeTruthy();
    }
  });
});

describe("catalog and compatibility", () => {
  it("has unique IDs, official HTTPS links, and valid engine references", () => {
    expect(toolById.size).toBe(tools.length);
    for (const tool of tools) {
      expect(tool.url.startsWith("https://")).toBe(true);
      for (const id of tool.engines ?? []) {
        expect(toolById.get(id)?.category).toBe("engine");
      }
    }
  });
  it("warns about engine-specific tools while keeping custom pipelines possible", () => {
    const picks = ["godot", "blueprints"];
    expect(
      compatibilityWarnings(picks, project()).some((warning) => warning.toolId === "blueprints"),
    ).toBe(true);
    expect(picks).toContain("blueprints");
  });
  it("reports Godot C# web exports as a documented conflict", () => {
    const warnings = compatibilityWarnings(["godot", "csharp"], project({ platforms: ["web"] }));
    expect(warnings.some((warning) => warning.message.includes("cannot export to the web"))).toBe(
      true,
    );
  });
  it("warns about a mismatched store and console access", () => {
    const warnings = compatibilityWarnings(["unity", "steam"], project({ platforms: ["console"] }));
    expect(warnings.some((warning) => warning.toolId === "steam")).toBe(true);
    expect(warnings.some((warning) => warning.message.includes("platform-holder approval"))).toBe(
      true,
    );
  });
});
