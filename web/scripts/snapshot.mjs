import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const { runSnapshot } = await import(path.join(__dirname, "../.next/server/app/api/today/route.js")).catch(async () => {
    const pkg = require("../package.json");
    console.log(`[snapshot] building ${pkg.name} first...`);
    const { execSync } = await import("node:child_process");
    execSync("npm run build", { stdio: "inherit", cwd: path.join(__dirname, "..") });
    return import(path.join(__dirname, "../.next/server/app/api/today/route.js"));
  });

  if (typeof runSnapshot !== "function") {
    console.error("[snapshot] runSnapshot not found");
    process.exit(1);
  }

  const result = await runSnapshot();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("[snapshot] failed", error);
  process.exit(1);
});
