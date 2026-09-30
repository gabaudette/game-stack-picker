import { resolveTools } from "./catalog";
import type { Answers, Tool, Warning } from "./types";

export function engineConflicts(engine: Tool, answers: Answers): string[] {
  const conflicts: string[] = [];
  if (engine.dimensions && !engine.dimensions.includes(answers.dimension)) {
    conflicts.push(
      `This catalog does not verify ${engine.name} for ${answers.dimension.toUpperCase()} projects.`,
    );
  }
  for (const platform of answers.platforms) {
    if (engine.platforms && !engine.platforms.includes(platform)) {
      conflicts.push(
        `${engine.name} has no direct ${platform} export in this catalog. Revisit your target or choose another engine or framework.`,
      );
    }
  }
  return conflicts;
}

export function compatibilityWarnings(ids: string[], answers: Answers): Warning[] {
  const selected = resolveTools(ids);
  const engine = selected.find((tool) => tool.category === "engine");
  const warnings: Warning[] = [];
  if (engine) {
    for (const message of engineConflicts(engine, answers)) {
      warnings.push({ toolId: engine.id, message });
    }
    if (engine.id === "godot" && ids.includes("csharp") && answers.platforms.includes("web")) {
      warnings.push({
        toolId: "csharp",
        message:
          "Godot 4 C# projects cannot export to the web. Use GDScript for this target or revisit your engine and platforms.",
      });
    }
    if (
      answers.platforms.includes("mobile") &&
      engine.mobileTargets &&
      !engine.mobileTargets.includes("ios")
    ) {
      warnings.push({
        toolId: engine.id,
        message: `${engine.name} has verified Android support in this catalog, but no verified iOS publishing route. Check the mobile target before committing to this stack.`,
      });
    }
    for (const tool of selected) {
      if (tool.engines && !tool.engines.includes(engine.id)) {
        warnings.push({
          toolId: tool.id,
          message: `${tool.name} is cataloged for ${tool.engines.join(", ")}, not ${engine.name}. A custom integration may be required.`,
        });
      }
    }
  }
  for (const tool of selected) {
    if (
      tool.category === "publish" &&
      tool.platforms &&
      !answers.platforms.some((platform) => tool.platforms?.includes(platform))
    ) {
      warnings.push({
        toolId: tool.id,
        message: `${tool.name} does not match your selected target platforms.`,
      });
    }
  }
  if (
    ids.includes("catch2") &&
    !ids.includes("cpp") &&
    engine?.id !== "sfml" &&
    engine?.id !== "unreal"
  ) {
    warnings.push({
      toolId: "catch2",
      message:
        "Catch2 requires a C++ test target. It does not directly test C or Odin procedures without a suitable C++ bridge.",
    });
  }
  if (answers.platforms.includes("console")) {
    warnings.push({
      toolId: engine?.id ?? "platform",
      message:
        "Console releases require platform-holder approval, SDK access, and an approved export or porting route. Availability must be verified with your engine vendor.",
    });
  }
  return warnings;
}
