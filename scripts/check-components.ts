import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const MAX_COMPONENT_LINES = 300;
async function check(directory: string): Promise<void> {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await check(path);
    } else if (path.endsWith(".tsx") && !path.endsWith(".test.tsx")) {
      const lines = (await readFile(path, "utf8")).trimEnd().split("\n").length;
      if (lines > MAX_COMPONENT_LINES) {
        throw new Error(
          `${path} contains ${lines} lines; the limit is ${MAX_COMPONENT_LINES}. Split it into focused components.`,
        );
      }
    }
  }
}
await check("src");
