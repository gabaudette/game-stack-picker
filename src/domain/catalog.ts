import catalog from "./catalog.json";
import type { Category, Tool } from "./types";

export const categories: Category[] = [
  {
    id: "engine",
    name: "Game engine",
    label: "01",
    description: "The foundation of your next world.",
  },
  { id: "code", name: "Programming", label: "02", description: "Bring your mechanics to life." },
  {
    id: "art",
    name: "Art & assets",
    label: "03",
    description: "Give your world its own visual language.",
  },
  {
    id: "animation",
    name: "Animation",
    label: "04",
    description: "A little motion makes all the difference.",
  },
  {
    id: "audio",
    name: "Audio",
    label: "05",
    description: "Make your game sound as good as it feels.",
  },
  {
    id: "network",
    name: "Networking",
    label: "06",
    description: "Connect players across your world.",
  },
  {
    id: "backend",
    name: "Backend",
    label: "07",
    description: "Support players beyond the game session.",
  },
  {
    id: "version",
    name: "Version control",
    label: "08",
    description: "Keep your work safe and your team in sync.",
  },
  {
    id: "planning",
    name: "Collaboration",
    label: "09",
    description: "Turn big ideas into small, shippable tasks.",
  },
  {
    id: "testing",
    name: "Testing & builds",
    label: "10",
    description: "Catch problems before your players do.",
  },
  {
    id: "publish",
    name: "Publishing",
    label: "11",
    description: "Get your game into players’ hands.",
  },
];

const categoryIds = new Set(categories.map((category) => category.id));
const engineIds = new Set(["godot", "unity", "unreal", "gamemaker", "gdevelop", "phaser"]);

function validateTool(tool: (typeof catalog)[number]): Tool {
  const category = categories.find((entry) => entry.id === tool.category)?.id;
  if (!category || !categoryIds.has(category)) {
    throw new Error(`Invalid category for ${tool.id}`);
  }
  const dimensions: Tool["dimensions"] = [];
  if (tool.dimensions) {
    for (const dimension of tool.dimensions) {
      if (dimension !== "2d" && dimension !== "3d") {
        throw new Error(`Invalid dimension for ${tool.id}`);
      }
      dimensions.push(dimension);
    }
  }
  const platforms: Tool["platforms"] = [];
  if (tool.platforms) {
    for (const platform of tool.platforms) {
      if (
        platform !== "desktop" &&
        platform !== "web" &&
        platform !== "mobile" &&
        platform !== "console"
      ) {
        throw new Error(`Invalid platform for ${tool.id}`);
      }
      platforms.push(platform);
    }
  }
  const { dimensions: rawDimensions, platforms: rawPlatforms, ...rest } = tool;
  const validated: Tool = { ...rest, category };
  if (rawDimensions) {
    validated.dimensions = dimensions;
  }
  if (rawPlatforms) {
    validated.platforms = platforms;
  }
  if (validated.engines?.some((id) => !engineIds.has(id))) {
    throw new Error(`Invalid engine reference for ${tool.id}`);
  }
  return validated;
}

export const tools: Tool[] = catalog.map(validateTool);
export const toolById = new Map(tools.map((tool) => [tool.id, tool]));
if (toolById.size !== tools.length) {
  throw new Error("Catalog contains duplicate tool IDs.");
}
export const engines = tools.filter((tool) => tool.category === "engine");
export const categoryById = new Map(categories.map((category) => [category.id, category]));

export function resolveTools(ids: string[]): Tool[] {
  const resolved: Tool[] = [];
  for (const id of ids) {
    const tool = toolById.get(id);
    if (tool) {
      resolved.push(tool);
    }
  }
  return resolved;
}
