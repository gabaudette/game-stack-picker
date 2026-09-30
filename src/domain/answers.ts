import type { Answers } from "./types";

export const CONFIG_VERSION = 1;
export const STORAGE_KEY = "loadout.config.v1";
export const defaultAnswers: Answers = {
  dimension: "2d",
  platforms: ["desktop"],
  team: "solo",
  experience: "beginner",
  budget: "free",
  multiplayer: "offline",
  art: "pixel",
  preferredEngine: "auto",
};

export const dimensions = ["2d", "3d"] as const;
export const platforms = ["desktop", "web", "mobile", "console"] as const;
export const teams = ["solo", "small", "studio"] as const;
export const experiences = ["beginner", "intermediate", "advanced"] as const;
export const budgets = ["free", "flexible", "professional"] as const;
export const multiplayerModes = ["offline", "local", "online"] as const;
export const artStyles = ["pixel", "illustrated", "stylized", "realistic"] as const;

export function isMember<T extends string>(value: unknown, values: readonly T[]): value is T {
  return typeof value === "string" && values.some((candidate) => candidate === value);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
