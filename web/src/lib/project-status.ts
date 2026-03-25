import { access } from "node:fs/promises";
import path from "node:path";
import { listHistorySnapshots } from "@/lib/history";
import { getSourceRegistry } from "@/lib/source-registry";

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getProjectStatus() {
  const [registry, snapshots] = await Promise.all([getSourceRegistry(), listHistorySnapshots()]);
  const latest = snapshots[0] ?? null;

  const webRoot = process.cwd();
  const statusDocPath = path.join(webRoot, "..", "STATUS.md");
  const sourceConfigUrl = process.env.ABSURDITY_SOURCE_CONFIG_URL ?? null;

  return {
    project: {
      name: "今日荒谬指数",
      app: "web",
      runtime: "Next.js 16 + React 19",
    },
    docs: {
      status_doc_exists: await fileExists(statusDocPath),
      status_doc_path: statusDocPath,
    },
    sources: {
      total: registry.length,
      enabled: registry.filter((item) => item.enabled).length,
      disabled: registry.filter((item) => !item.enabled).length,
      remote_config: Boolean(sourceConfigUrl),
      remote_config_url: sourceConfigUrl,
      items: registry.map((item) => ({
        key: item.key,
        label: item.label,
        enabled: item.enabled,
        limit: item.limit,
        enabledByDefault: item.enabledByDefault,
      })),
    },
    ai: {
      scoring_enabled: Boolean(
        process.env.AI_SCORING_BASE_URL && process.env.AI_SCORING_API_KEY && process.env.AI_SCORING_MODEL,
      ),
      base_url_configured: Boolean(process.env.AI_SCORING_BASE_URL),
      model_configured: Boolean(process.env.AI_SCORING_MODEL),
    },
    history: {
      snapshots: snapshots.length,
      latest_date: latest?.date ?? null,
      latest_index: latest?.daily_index ?? null,
      latest_level: latest?.level ?? null,
      latest_share_image: latest?.share_image ?? null,
    },
    routes: {
      home: "/",
      history: "/history",
      today_api: "/api/today",
      status_api: "/api/status",
      status_page: "/status",
    },
    generated_at: new Date().toISOString(),
  };
}
