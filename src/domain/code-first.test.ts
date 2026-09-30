import { describe, expect, it } from "vitest";
import { logoData } from "../assets/logos";
import { buildPrompt } from "../exports/export";
import { configSearch, decodeConfig, rawFromSearch } from "../state/config";
import { CONFIG_VERSION, defaultAnswers } from "./answers";
import { engines, toolById } from "./catalog";
import { compatibilityWarnings, engineConflicts } from "./compatibility";
import { recommend } from "./recommend";
import type { Answers } from "./types";

const project = (preferredEngine: string, overrides: Partial<Answers> = {}): Answers => ({
  ...defaultAnswers,
  preferredEngine,
  platforms: ["desktop"],
  experience: "advanced",
  ...overrides,
});

const pipelines = [
  { foundation: "bevy", code: "rust", support: "cargo" },
  { foundation: "sfml", code: "cpp", support: "cmake" },
  { foundation: "raylib", code: "c", support: "cmake" },
  { foundation: "sdl3", code: "c", support: "cmake" },
  { foundation: "love", code: "lua", support: "krita-animation" },
  { foundation: "monogame", code: "csharp", support: "dotnet-test" },
  { foundation: "defold", code: "lua", support: "engine-animation" },
];

describe("expanded foundation pipelines", () => {
  it.each(pipelines)(
    "builds a compatible $foundation pipeline",
    ({ foundation, code, support }) => {
      const answers = project(foundation);
      const result = recommend(answers);
      expect(result.engine?.id).toBe(foundation);
      expect(result.picks).toEqual(expect.arrayContaining([code, support]));
      expect(compatibilityWarnings(result.picks, answers)).toEqual([]);
      for (const id of result.picks) {
        expect(result.reasons.get(id)).toBeTruthy();
      }
    },
  );

  it("includes Bevy as a code-first option for advanced 3D developers", () => {
    const result = recommend(project("auto", { dimension: "3d", art: "stylized" }));
    expect(result.engine?.id).toBe("bevy");
    expect(result.picks).toContain("cargo");
  });

  it("does not invent engine animation tooling for multimedia libraries", () => {
    for (const id of ["sfml", "raylib", "sdl3", "love", "monogame"]) {
      const result = recommend(project(id));
      expect(result.picks).not.toContain("engine-animation");
      expect(result.picks).toContain("krita-animation");
      expect(result.notices.join(" ")).toContain("scene workflow");
    }
  });

  it("keeps SFML when requested but flags unsupported web and 3D targets", () => {
    const answers = project("sfml", { platforms: ["web"], dimension: "3d" });
    const result = recommend(answers);
    expect(result.engine?.id).toBe("sfml");
    expect(result.notices.join(" ")).toContain("3D projects");
    expect(result.notices.join(" ")).toContain("no direct web export");
    expect(result.alternatives.some((engine) => engine.id === "sfml")).toBe(false);
  });

  it("recommends only a verified Android publishing route for raylib", () => {
    const answers = project("raylib", { platforms: ["mobile"] });
    const result = recommend(answers);
    expect(result.picks).toContain("google-play");
    expect(result.picks).not.toContain("app-store");
    expect(result.notices.join(" ")).toContain("iOS publishing route is not verified");
    expect(
      compatibilityWarnings(result.picks, answers).some((warning) => warning.toolId === "raylib"),
    ).toBe(true);
  });

  it("accepts raylib and Odin and warns about C++-only tests", () => {
    expect(compatibilityWarnings(["raylib", "odin", "odin-test"], project("raylib"))).toEqual([]);
    expect(
      compatibilityWarnings(["raylib", "odin", "catch2"], project("raylib")).some(
        (warning) => warning.toolId === "catch2",
      ),
    ).toBe(true);
  });

  it("accepts Odin with SDL3 but does not imply Bevy uses Odin", () => {
    expect(compatibilityWarnings(["sdl3", "odin"], project("sdl3"))).toEqual([]);
    expect(
      compatibilityWarnings(["bevy", "odin"], project("bevy")).some(
        (warning) => warning.toolId === "odin",
      ),
    ).toBe(true);
  });

  it("round trips new selections and preserves an existing version-1 link", () => {
    const config = {
      version: CONFIG_VERSION,
      picks: ["bevy", "rust", "cargo", "ldtk"],
      answers: project("bevy"),
    };
    expect(decodeConfig(rawFromSearch(configSearch(config)))).toEqual({ config, notices: [] });
    const old = decodeConfig(rawFromSearch("?v=1&picks=godot,gdscript&engine=godot"));
    expect(old.config.picks).toEqual(["godot", "gdscript"]);
    expect(old.notices).toEqual([]);
  });

  it("exports new tools and programming pairings in project prompts", () => {
    const prompt = buildPrompt({
      version: CONFIG_VERSION,
      picks: ["raylib", "odin", "odin-test"],
      answers: project("raylib"),
    });
    expect(prompt).toContain("raylib");
    expect(prompt).toContain("Odin");
    expect(prompt).toContain("https://odin-lang.org/");
  });

  it("uses sourced SVGs for Bevy, Rust, SFML, and Odin", () => {
    for (const id of ["bevy", "rust", "sfml", "odin"]) {
      expect(logoData(id)).toMatch(/^data:image\/svg\+xml;base64,/);
    }
  });

  it("validates every foundation's kinds and filters unsupported targets", () => {
    for (const engine of engines) {
      expect(["engine", "framework", "library"]).toContain(engine.kind);
      const result = recommend(project(engine.id));
      expect(
        result.picks.filter((id) => toolById.get(id)?.category === "code").length,
      ).toBeGreaterThan(0);
      for (const alternative of result.alternatives) {
        expect(engineConflicts(alternative, project(engine.id))).toEqual([]);
      }
    }
  });
});
