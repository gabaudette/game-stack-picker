import { engines, resolveTools, toolById } from "./catalog";
import { engineConflicts } from "./compatibility";
import type { Answers, Recommendation, Tool } from "./types";

const scoreWeights = {
  dimension: 8,
  web: 12,
  beginner: 6,
  studio: 10,
  free: 5,
  pixel: 4,
  realistic: 9,
  experienced: 3,
  codeFirst: 4,
};
const ALTERNATIVE_COUNT = 2;

function engineScore(engine: Tool, answers: Answers): number {
  let score = 0;
  if (engine.tags.includes(answers.dimension)) {
    score += scoreWeights.dimension;
  }
  if (answers.platforms.includes("web") && engine.id === "phaser") {
    score += scoreWeights.web;
  }
  if (answers.experience === "beginner" && engine.tags.includes("beginner")) {
    score += scoreWeights.beginner;
  }
  if (answers.experience === "beginner" && engine.id === "gdevelop") {
    score += scoreWeights.experienced;
  }
  if (answers.team === "studio" && engine.tags.includes("studio")) {
    score += scoreWeights.studio;
  }
  if (answers.budget === "free" && engine.free) {
    score += scoreWeights.free;
  }
  if (answers.art === "pixel" && engine.tags.includes("pixel")) {
    score += scoreWeights.pixel;
  }
  if (answers.art === "realistic" && engine.id === "unreal") {
    score += scoreWeights.realistic;
  }
  if (answers.experience !== "beginner" && engine.id === "godot") {
    score += scoreWeights.experienced;
  }
  if (
    answers.experience === "advanced" &&
    answers.team !== "studio" &&
    engine.tags.includes("code-first")
  ) {
    score += scoreWeights.codeFirst;
  }
  return score;
}

const programming = new Map<string, string[]>([
  ["godot", ["gdscript", "vscode"]],
  ["unity", ["csharp", "vscode"]],
  ["unreal", ["blueprints", "cpp"]],
  ["gamemaker", ["gml"]],
  ["gdevelop", ["events"]],
  ["phaser", ["typescript", "vscode"]],
  ["bevy", ["rust", "vscode"]],
  ["sfml", ["cpp", "vscode"]],
  ["raylib", ["c", "vscode"]],
  ["sdl3", ["c", "vscode"]],
  ["love", ["lua", "vscode"]],
  ["monogame", ["csharp", "vscode"]],
  ["defold", ["lua"]],
]);
const networking = new Map<string, string>([
  ["godot", "godot-multiplayer"],
  ["unity", "unity-netcode"],
  ["unreal", "unreal-replication"],
]);
const testing = new Map<string, string>([
  ["godot", "gut"],
  ["unity", "unity-test"],
  ["unreal", "unreal-automation"],
  ["phaser", "playwright"],
  ["bevy", "cargo"],
  ["sfml", "catch2"],
  ["monogame", "dotnet-test"],
]);

export function recommend(answers: Answers): Recommendation {
  const eligible = engines
    .filter((engine) => engineConflicts(engine, answers).length === 0)
    .sort((a, b) => engineScore(b, answers) - engineScore(a, answers) || a.id.localeCompare(b.id));
  let engine = eligible[0];
  const notices: string[] = [];
  if (answers.preferredEngine !== "auto") {
    engine = engines.find((tool) => tool.id === answers.preferredEngine);
    if (engine) {
      notices.push(...engineConflicts(engine, answers));
    } else {
      notices.push("Your preferred engine is no longer in the catalog. Choose another engine.");
    }
  }
  const alternatives = eligible
    .filter((tool) => tool.id !== engine?.id)
    .slice(0, ALTERNATIVE_COUNT);
  const picks: string[] = [];
  const reasons = new Map<string, string>();
  const add = (id: string, reason: string) => {
    if (!toolById.has(id)) {
      throw new Error(`Recommendation references unknown tool: ${id}`);
    }
    if (!picks.includes(id)) {
      picks.push(id);
      reasons.set(id, reason);
    }
  };
  if (!engine) {
    notices.push(
      "No verified engine or framework fits all selected targets. Revisit your platforms or choose a preferred engine to inspect its limitations.",
    );
    return { engine, alternatives, picks, reasons, notices };
  }
  let engineReason = `A curated fit for your ${answers.dimension.toUpperCase()} project, ${answers.team} team, and ${answers.platforms.join(" + ")} targets.`;
  if (answers.preferredEngine !== "auto") {
    engineReason =
      "Your preferred engine. Review the compatibility notices before committing to its pipeline.";
  }
  add(engine.id, engineReason);
  if (engine.note) {
    notices.push(engine.note);
  }
  if (engine.kind === "library" || engine.kind === "framework") {
    notices.push(
      `${engine.name} is a ${engine.kind}. You own the project architecture and scene workflow; the suggested tools do not turn it into a full visual game editor.`,
    );
  }
  for (const id of programming.get(engine.id) ?? []) {
    add(id, `A programming tool used with ${engine.name}.`);
  }
  if (answers.art === "pixel") {
    if (answers.budget === "free") {
      add("krita", "Free painting and pixel-art workflows.");
    } else {
      add("aseprite", "Purpose-built pixel art and frame animation.");
    }
  } else if (answers.dimension === "2d" || answers.art === "illustrated") {
    add("krita", "An open-source illustration and painting workflow.");
  }
  if (answers.dimension === "3d") {
    add("blender", "Open-source modeling, rigging, and animation for 3D assets.");
    add("blender-animation", "Animate and rig assets in the same production tool.");
    if (answers.budget !== "free" && answers.art === "realistic") {
      add("substance", "Optional specialist material authoring for realistic assets.");
    }
  } else if (toolById.get("engine-animation")?.engines?.includes(engine.id)) {
    add("engine-animation", "Start with your foundation’s built-in animation tools.");
  } else {
    add(
      "krita-animation",
      "Author 2D frames separately, then implement animation playback in your code-first runtime.",
    );
  }
  if (answers.dimension === "2d" && engine.tags.includes("code-first")) {
    add(
      "tiled",
      "Optional tile-map and object-layer authoring; select a compatible loader for your runtime.",
    );
  }
  add("audacity", "Free recording and editing for sound effects.");
  if (answers.team === "studio" && answers.budget !== "free") {
    add("reaper", "A licensed workstation for a larger audio production workflow.");
    if (engine.id === "unity" || engine.id === "unreal") {
      add("fmod", "Optional middleware for adaptive audio; check the applicable license.");
    }
  }
  if (answers.multiplayer === "online") {
    const network = networking.get(engine.id);
    if (network) {
      add(network, `Use ${engine.name}’s engine-specific networking foundation.`);
    } else {
      notices.push(
        `${engine.name} needs a project-specific online networking integration; no verified built-in choice is cataloged.`,
      );
    }
    add(
      "nakama",
      "Optional open-source game backend for player services; self-hosting still has operating costs.",
    );
    notices.push(
      "Online game architecture, authority, latency, and backend integration must be validated for your project.",
    );
  }
  if (answers.team === "studio" && answers.budget === "professional") {
    add(
      "perforce",
      "Centralized version control for large binary asset pipelines; check licensing.",
    );
  } else {
    add(
      "git-lfs",
      "Track source code and large game assets together; hosted storage may cost extra.",
    );
  }
  add("github", "Keep source changes, issues, and code review together.");
  if (answers.team === "studio") {
    add("jira", "Optional production planning for multiple disciplines.");
  } else {
    add("trello", "A lightweight way to plan and track your next milestone.");
  }
  if (engine.id === "sfml" || engine.id === "raylib" || engine.id === "sdl3") {
    add("cmake", "Configure native library builds and generate a build system for your toolchain.");
  }
  const testTool = testing.get(engine.id);
  if (testTool) {
    add(testTool, `Test your ${engine.name} project using an appropriate testing workflow.`);
  }
  add(
    "github-actions",
    "Automate supported builds and checks; runner and engine licensing need verification.",
  );
  if (answers.platforms.includes("desktop")) {
    add("itch", "A direct route to sharing desktop builds.");
    if (answers.budget !== "free") {
      add("steam", "Optional commercial desktop distribution; onboarding fees apply.");
    }
  }
  if (answers.platforms.includes("web")) {
    add("itch", "Publish a supported HTML5 build for browser players.");
  }
  if (answers.platforms.includes("mobile")) {
    if (!engine.platforms?.includes("mobile")) {
      notices.push(
        "No direct mobile route is verified for this foundation. Confirm a porting route before choosing mobile stores.",
      );
    } else {
      const mobileTargets = engine.mobileTargets ?? ["android", "ios"];
      if (mobileTargets.includes("android")) {
        add("google-play", "Publish Android builds after meeting store requirements.");
      }
      if (mobileTargets.includes("ios")) {
        add(
          "app-store",
          "Publish iOS builds after meeting Apple’s developer and build requirements.",
        );
      } else {
        notices.push(
          "The catalog verifies Android mobile builds for this foundation. An iOS publishing route is not verified.",
        );
      }
    }
  }
  if (answers.platforms.includes("console")) {
    notices.push(
      "Console SDKs, vendor approval, and engine export access are required. Verify your porting route before committing to the stack.",
    );
  }
  if (answers.budget === "free") {
    notices.push(
      "Free budget prioritizes no-cost tools. Hosting, store enrollment, console access, and commercial licenses may still incur costs.",
    );
  }
  const selectedEngine = resolveTools(picks).find((tool) => tool.category === "engine");
  return { engine: selectedEngine, alternatives, picks, reasons, notices };
}
