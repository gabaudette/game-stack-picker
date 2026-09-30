import { describe, expect, it } from "vitest";
import { CONFIG_VERSION, defaultAnswers, STORAGE_KEY } from "../domain/answers";
import type { StackConfig } from "../domain/types";
import {
  configSearch,
  decodeConfig,
  emptyConfig,
  initialConfiguration,
  rawFromSearch,
  readSavedConfig,
  toQuery,
} from "./config";

const selected: StackConfig = {
  version: CONFIG_VERSION,
  picks: ["godot", "gdscript", "blender"],
  answers: {
    ...defaultAnswers,
    dimension: "3d",
    multiplayer: "online",
    platforms: ["desktop", "mobile"],
    preferredEngine: "godot",
  },
};

describe("configuration boundaries", () => {
  it("round trips a complete stack through its query string", () => {
    expect(decodeConfig(rawFromSearch(configSearch(selected)))).toEqual({
      config: selected,
      notices: [],
    });
  });
  it("keeps valid IDs and reports invalid IDs and duplicate engines", () => {
    const result = decodeConfig({
      ...toQuery(selected),
      picks: "godot,missing,unity,blender,godot",
    });
    expect(result.config.picks).toEqual(["godot", "blender"]);
    expect(result.notices.join(" ")).toContain("Unknown tool");
    expect(result.notices.join(" ")).toContain("Multiple engines");
  });
  it("validates answers, platforms, and versions without unsafe assertions", () => {
    const result = decodeConfig({
      ...toQuery(selected),
      dimension: "4d",
      platforms: "mobile,toaster",
      engine: "missing",
      v: "99",
    });
    expect(result.config.answers.dimension).toBe("2d");
    expect(result.config.answers.platforms).toEqual(["mobile"]);
    expect(result.config.answers.preferredEngine).toBe("auto");
    expect(result.notices.join(" ")).toContain("unsupported version");
  });
  it("restores a valid saved stack", () => {
    expect(readSavedConfig(JSON.stringify(selected)).config).toEqual(selected);
  });
  it("rejects malformed saved data", () => {
    expect(() => readSavedConfig("{")).toThrow();
    expect(() => readSavedConfig(JSON.stringify({ picks: [false], answers: {} }))).toThrow(
      "invalid shape",
    );
  });
  it("prioritizes an explicit empty URL stack over saved picks", () => {
    const storage = { getItem: () => JSON.stringify(selected) };
    expect(initialConfiguration("?v=1&picks=", storage).config.picks).toEqual([]);
  });
  it("uses local persistence only when there are no config query keys", () => {
    const storage = {
      getItem: (key: string) => {
        expect(key).toBe(STORAGE_KEY);
        return JSON.stringify(selected);
      },
    };
    expect(initialConfiguration("?utm_source=test", storage).config).toEqual(selected);
  });
  it("reports unavailable storage instead of silently losing state", () => {
    const result = initialConfiguration("", {
      getItem: () => {
        throw new Error("Access denied");
      },
    });
    expect(result.config).toEqual(emptyConfig);
    expect(result.notices.join(" ")).toContain("Access denied");
  });
});
