import { categoryById, resolveTools } from "../domain/catalog";
import { compatibilityWarnings } from "../domain/compatibility";
import type { StackConfig } from "../domain/types";
import { buildDiagram } from "./diagram";

export function buildPrompt(config: StackConfig): string {
  const selected = resolveTools(config.picks);
  const answers = config.answers;
  const lines = [
    "Help me plan and build a game using the following project brief.",
    "",
    `Dimension: ${answers.dimension.toUpperCase()}`,
    `Platforms: ${answers.platforms.join(", ")}`,
    `Team: ${answers.team}`,
    `Experience: ${answers.experience}`,
    `Budget: ${answers.budget}`,
    `Multiplayer: ${answers.multiplayer}`,
    `Art style: ${answers.art}`,
    `Preferred engine: ${answers.preferredEngine}`,
    "",
    "Selected stack:",
  ];
  if (selected.length === 0) {
    lines.push("No tools selected yet. Help me identify a suitable starting stack.");
  }
  for (const tool of selected) {
    lines.push(
      `- ${categoryById.get(tool.category)?.name ?? tool.category}: ${tool.name} (${tool.url}) — ${tool.cost}`,
    );
    if (tool.note) {
      lines.push(`  Consideration: ${tool.note}`);
    }
  }
  const warnings = compatibilityWarnings(config.picks, answers);
  if (warnings.length > 0) {
    lines.push("", "Compatibility considerations:");
    for (const warning of warnings) {
      lines.push(`- ${warning.message}`);
    }
  }
  lines.push(
    "",
    "Validate compatibility, licensing, security, and platform access. Identify missing choices and propose a practical first milestone. Ask about requirements that are still unclear.",
  );
  return lines.join("\n");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  const cleanupDelay = 1000;
  window.setTimeout(() => URL.revokeObjectURL(url), cleanupDelay);
}

export function svgBlob(config: StackConfig): Blob {
  return new Blob([buildDiagram(config).svg], { type: "image/svg+xml;charset=utf-8" });
}

export async function pngBlob(config: StackConfig): Promise<Blob> {
  const diagram = buildDiagram(config);
  const svgUrl = URL.createObjectURL(
    new Blob([diagram.svg], { type: "image/svg+xml;charset=utf-8" }),
  );
  try {
    const image = new Image();
    image.src = svgUrl;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = diagram.width;
    canvas.height = diagram.height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error(
        "Your browser could not create the diagram image. Try the SVG download instead.",
      );
    }
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNG encoding failed. Try the SVG download instead."));
        }
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}
