import manifest from "./logos.json";

const logoFiles = import.meta.glob<string>("./logos/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const dataUris = new Map<string, string>();
const logoNames = new Map<string, string>(Object.entries(manifest));

export function logoPath(id: string): string | undefined {
  const filename = logoNames.get(id);
  if (filename) {
    return logoData(id);
  }
  return undefined;
}

export function logoData(id: string): string | undefined {
  const filename = logoNames.get(id);
  if (!filename) {
    return undefined;
  }
  const cached = dataUris.get(filename);
  if (cached) {
    return cached;
  }
  const svg = logoFiles[`./logos/${filename}`];
  if (!svg) {
    throw new Error(`Missing embedded logo for ${id}`);
  }
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const uri = `data:image/svg+xml;base64,${btoa(binary)}`;
  dataUris.set(filename, uri);
  return uri;
}
