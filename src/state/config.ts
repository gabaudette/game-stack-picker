import { createSerializer, parseAsString } from "nuqs";
import {
  artStyles,
  budgets,
  CONFIG_VERSION,
  defaultAnswers,
  dimensions,
  experiences,
  isMember,
  isRecord,
  multiplayerModes,
  platforms,
  STORAGE_KEY,
  teams,
} from "../domain/answers";
import { engines, toolById } from "../domain/catalog";
import type { StackConfig } from "../domain/types";

export const queryParsers = {
  v: parseAsString,
  picks: parseAsString,
  dimension: parseAsString,
  platforms: parseAsString,
  team: parseAsString,
  experience: parseAsString,
  budget: parseAsString,
  multiplayer: parseAsString,
  art: parseAsString,
  engine: parseAsString,
};
export type RawConfig = { [K in keyof typeof queryParsers]: string | null };
export type Decoded = { config: StackConfig; notices: string[] };
export const emptyConfig: StackConfig = {
  version: CONFIG_VERSION,
  picks: [],
  answers: defaultAnswers,
};
const serialize = createSerializer(queryParsers);

export function toQuery(config: StackConfig): RawConfig {
  return {
    v: String(CONFIG_VERSION),
    picks: config.picks.join(","),
    dimension: config.answers.dimension,
    platforms: config.answers.platforms.join(","),
    team: config.answers.team,
    experience: config.answers.experience,
    budget: config.answers.budget,
    multiplayer: config.answers.multiplayer,
    art: config.answers.art,
    engine: config.answers.preferredEngine,
  };
}

export function configSearch(config: StackConfig): string {
  return serialize(toQuery(config));
}

export function decodeConfig(raw: RawConfig): Decoded {
  const notices: string[] = [];
  const config: StackConfig = {
    version: CONFIG_VERSION,
    picks: [],
    answers: { ...defaultAnswers, platforms: [...defaultAnswers.platforms] },
  };
  if (raw.v !== null && raw.v !== String(CONFIG_VERSION)) {
    notices.push(
      "This configuration uses an unsupported version. Valid selections were recovered; review your stack.",
    );
  }
  const seen = new Set<string>();
  let hasEngine = false;
  for (const id of (raw.picks ?? "").split(",").filter(Boolean)) {
    const tool = toolById.get(id);
    if (!tool) {
      notices.push(`Unknown tool “${id}” was removed from the configuration.`);
      continue;
    }
    if (seen.has(id)) {
      continue;
    }
    if (tool.category === "engine") {
      if (hasEngine) {
        notices.push("Multiple engines were supplied. Only the first foundation was kept.");
        continue;
      }
      hasEngine = true;
    }
    seen.add(id);
    config.picks.push(id);
  }
  const validate = <T extends string>(
    key: keyof RawConfig,
    allowed: readonly T[],
    fallback: T,
  ): T => {
    const value = raw[key];
    if (value === null) {
      return fallback;
    }
    if (isMember(value, allowed)) {
      return value;
    }
    notices.push(`Invalid ${key} value was replaced with its default.`);
    return fallback;
  };
  config.answers.dimension = validate("dimension", dimensions, defaultAnswers.dimension);
  config.answers.team = validate("team", teams, defaultAnswers.team);
  config.answers.experience = validate("experience", experiences, defaultAnswers.experience);
  config.answers.budget = validate("budget", budgets, defaultAnswers.budget);
  config.answers.multiplayer = validate(
    "multiplayer",
    multiplayerModes,
    defaultAnswers.multiplayer,
  );
  config.answers.art = validate("art", artStyles, defaultAnswers.art);
  config.answers.preferredEngine = validate(
    "engine",
    ["auto", ...engines.map((engine) => engine.id)],
    "auto",
  );
  if (raw.platforms !== null) {
    const valid = new Set(config.answers.platforms.slice(0, 0));
    for (const platform of raw.platforms.split(",")) {
      if (isMember(platform, platforms)) {
        valid.add(platform);
      } else {
        notices.push(`Unsupported platform “${platform}” was removed.`);
      }
    }
    if (valid.size > 0) {
      config.answers.platforms = [...valid];
    } else {
      notices.push("At least one platform is required. Desktop was restored.");
    }
  }
  return { config, notices };
}

export function rawFromSearch(search: string): RawConfig {
  const params = new URLSearchParams(search);
  return {
    v: params.get("v"),
    picks: params.get("picks"),
    dimension: params.get("dimension"),
    platforms: params.get("platforms"),
    team: params.get("team"),
    experience: params.get("experience"),
    budget: params.get("budget"),
    multiplayer: params.get("multiplayer"),
    art: params.get("art"),
    engine: params.get("engine"),
  };
}

export function readSavedConfig(value: string): Decoded {
  const parsed: unknown = JSON.parse(value);
  if (
    !isRecord(parsed) ||
    !isRecord(parsed.answers) ||
    !Array.isArray(parsed.picks) ||
    !parsed.picks.every((id) => typeof id === "string")
  ) {
    throw new Error("Saved configuration has an invalid shape. Reset it or create a new stack.");
  }
  const stringValue = (value: unknown): string | null => {
    if (value === undefined) {
      return null;
    }
    if (typeof value === "string") {
      return value;
    }
    return "invalid";
  };
  let savedPlatforms = "invalid";
  if (
    Array.isArray(parsed.answers.platforms) &&
    parsed.answers.platforms.every((value) => typeof value === "string")
  ) {
    savedPlatforms = parsed.answers.platforms.join(",");
  }
  return decodeConfig({
    v: String(parsed.version),
    picks: parsed.picks.join(","),
    dimension: stringValue(parsed.answers.dimension),
    platforms: savedPlatforms,
    team: stringValue(parsed.answers.team),
    experience: stringValue(parsed.answers.experience),
    budget: stringValue(parsed.answers.budget),
    multiplayer: stringValue(parsed.answers.multiplayer),
    art: stringValue(parsed.answers.art),
    engine: stringValue(parsed.answers.preferredEngine),
  });
}

export function initialConfiguration(search: string, storage: Pick<Storage, "getItem">): Decoded {
  const params = new URLSearchParams(search);
  if (Object.keys(queryParsers).some((key) => params.has(key))) {
    return decodeConfig(rawFromSearch(search));
  }
  try {
    const saved = storage.getItem(STORAGE_KEY);
    if (saved) {
      return readSavedConfig(saved);
    }
  } catch (error) {
    return {
      config: emptyConfig,
      notices: [`Could not restore the saved stack: ${errorMessage(error)}`],
    };
  }
  return { config: emptyConfig, notices: [] };
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
}
