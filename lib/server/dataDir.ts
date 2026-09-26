import path from "node:path";

/** Root of the file-based stores. AVEROS_DATA_DIR lets e2e tests use an isolated copy. */
export function dataDir(...parts: string[]): string {
  return path.join(process.cwd(), process.env.AVEROS_DATA_DIR || ".data", ...parts);
}
