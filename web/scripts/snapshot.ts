import { runSnapshot } from "@/lib/snapshot";

async function main() {
  const result = await runSnapshot();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("[snapshot] failed", error);
  process.exit(1);
});
