import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const specPath = join(root, "../trip-sync-contracts/docs/openapi/openapi.json");

if (!existsSync(specPath)) {
  console.error("Missing contracts OpenAPI at", specPath);
  process.exit(1);
}

const spec = JSON.parse(readFileSync(specPath, "utf-8"));
if (spec.info?.title !== "TripSync API") {
  process.exit(1);
}

console.log("OpenAPI contract OK:", specPath);
