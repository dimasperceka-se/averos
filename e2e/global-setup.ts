import { rm } from "node:fs/promises";
import { DATA_DIR } from "./helpers";

/** Start every run from an empty store. */
export default async function globalSetup() {
  await rm(DATA_DIR, { recursive: true, force: true });
}
