import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const candidatePaths = [
  (() => {
    try {
      return require.resolve("@trip-sync/contracts/openapi.json");
    } catch {
      return undefined;
    }
  })(),
  join(root, "trip-sync-contracts/docs/openapi/openapi.json"),
  join(root, "../trip-sync-contracts/docs/openapi/openapi.json"),
].filter(Boolean);

const specPath = candidatePaths.find((path) => existsSync(path));

if (!specPath) {
  console.error("Missing contracts OpenAPI. Checked:");
  for (const path of candidatePaths) {
    console.error("-", path);
  }
  process.exit(1);
}

const spec = JSON.parse(readFileSync(specPath, "utf-8"));
if (spec.info?.title !== "TripSync API") {
  process.exit(1);
}

console.log("OpenAPI contract OK:", specPath);
