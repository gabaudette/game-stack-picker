import { logoData } from "../assets/logos";
import { categoryById, resolveTools } from "../domain/catalog";
import { compatibilityWarnings } from "../domain/compatibility";
import type { StackConfig } from "../domain/types";

const layout = {
  width: 1000,
  margin: 48,
  header: 166,
  row: 88,
  gap: 12,
  footer: 54,
  logo: 42,
  nameX: 120,
  labelX: 820,
  textSize: 20,
  noteSize: 14,
  maxCharacters: 108,
};

export function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(text: string): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line.length + word.length > layout.maxCharacters) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) {
    lines.push(line);
  }
  return lines;
}

export function buildDiagram(config: StackConfig): { svg: string; width: number; height: number } {
  const selected = resolveTools(config.picks);
  const warnings = compatibilityWarnings(config.picks, config.answers).flatMap((warning) =>
    wrapText(warning.message),
  );
  const notes = [
    `Team: ${config.answers.team} · Experience: ${config.answers.experience} · Budget: ${config.answers.budget}`,
    `Multiplayer: ${config.answers.multiplayer} · Art: ${config.answers.art} · Preferred engine: ${config.answers.preferredEngine}`,
    ...warnings,
  ];
  const notesY = layout.header + selected.length * (layout.row + layout.gap);
  const noteRow = 24;
  const height = notesY + notes.length * noteRow + layout.footer;
  const rows = selected
    .map((tool, index) => {
      const y = layout.header + index * (layout.row + layout.gap);
      const logo = logoData(tool.id);
      let image = `<text x="${layout.margin + layout.logo}" y="${y + layout.logo}" fill="#b7f76b" font-size="24">${escapeXml(tool.name.slice(0, 1))}</text>`;
      if (logo) {
        image = `<image href="${logo}" x="${layout.margin + layout.gap}" y="${y + layout.gap}" width="${layout.logo}" height="${layout.logo}"/>`;
      }
      return `<rect x="${layout.margin}" y="${y}" width="${layout.width - layout.margin * 2}" height="${layout.row}" rx="12" fill="#1b211e" stroke="#364035"/>${image}<text x="${layout.nameX}" y="${y + layout.logo}" font-size="${layout.textSize}" fill="#f2f5ee">${escapeXml(tool.name)}</text><text x="${layout.nameX}" y="${y + layout.logo + layout.textSize}" font-size="${layout.noteSize}" fill="#b5beb0">${escapeXml(tool.cost)}</text><text x="${layout.labelX}" y="${y + layout.logo}" fill="#b7f76b" font-size="${layout.noteSize}">${escapeXml(categoryById.get(tool.category)?.name ?? tool.category)}</text>`;
    })
    .join("");
  const noteText = notes
    .map(
      (note, index) =>
        `<text x="${layout.margin}" y="${notesY + index * noteRow}" fill="#b5beb0" font-size="${layout.noteSize}">${escapeXml(note)}</text>`,
    )
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${height}" viewBox="0 0 ${layout.width} ${height}"><title>Loadout game development stack</title><rect width="100%" height="100%" fill="#101413"/><g font-family="Arial, sans-serif"><text x="${layout.margin}" y="60" font-size="14" fill="#b7f76b" letter-spacing="4">LOADOUT / GAME STACK PICKER</text><text x="${layout.margin}" y="110" font-size="36" font-weight="bold" fill="#f2f5ee">Your next game starts here.</text><text x="${layout.margin}" y="140" font-size="16" fill="#b5beb0">${config.answers.dimension.toUpperCase()} · ${escapeXml(config.answers.platforms.join(" + "))} · ${selected.length} tools selected</text>${rows}${noteText}</g></svg>`;
  return { svg, width: layout.width, height };
}
