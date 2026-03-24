import { fetchBaiduItems } from "@/lib/sources/baidu";
import { fetch36KrItems } from "@/lib/sources/kr36";
import { fetchHackerNewsItems } from "@/lib/sources/hackernews";
import { fetchIthomeItems } from "@/lib/sources/ithome";
import { fetchRssSourceItems } from "@/lib/sources/rss";
import { fetchSspaiItems } from "@/lib/sources/sspai";
import { fetchTencentItems } from "@/lib/sources/tencent";
import { fetchThePaperItems } from "@/lib/sources/thepaper";
import { fetchToutiaoItems } from "@/lib/sources/toutiao";
import { fetchWallstreetcnItems } from "@/lib/sources/wallstreetcn";
import { fetchWeiboItems } from "@/lib/sources/weibo";
import { fetchJson } from "@/lib/source-utils";

export type SourceKey =
  | "weibo"
  | "baidu"
  | "ithome"
  | "kr36"
  | "thepaper"
  | "wallstreetcn"
  | "toutiao"
  | "sspai"
  | "tencent"
  | "rss"
  | "hackernews";

export type SourceRegistryItem = {
  key: SourceKey;
  label: string;
  enabledByDefault: boolean;
  limit: number;
  fetcher: (limit: number) => Promise<import("@/lib/absurdity").AbsurdityItem[]>;
};

const DEFAULT_SOURCE_REGISTRY: SourceRegistryItem[] = [
  { key: "weibo", label: "微博热搜", enabledByDefault: true, limit: 10, fetcher: fetchWeiboItems },
  { key: "baidu", label: "百度热搜", enabledByDefault: true, limit: 8, fetcher: fetchBaiduItems },
  { key: "ithome", label: "IT之家", enabledByDefault: true, limit: 6, fetcher: fetchIthomeItems },
  { key: "kr36", label: "36氪", enabledByDefault: true, limit: 6, fetcher: fetch36KrItems },
  { key: "thepaper", label: "澎湃新闻", enabledByDefault: true, limit: 6, fetcher: fetchThePaperItems },
  { key: "wallstreetcn", label: "华尔街见闻", enabledByDefault: true, limit: 6, fetcher: fetchWallstreetcnItems },
  { key: "toutiao", label: "今日头条", enabledByDefault: true, limit: 6, fetcher: fetchToutiaoItems },
  { key: "sspai", label: "少数派", enabledByDefault: true, limit: 6, fetcher: fetchSspaiItems },
  { key: "tencent", label: "腾讯新闻", enabledByDefault: true, limit: 6, fetcher: fetchTencentItems },
  { key: "rss", label: "Google News RSS", enabledByDefault: true, limit: 2, fetcher: fetchRssSourceItems },
  { key: "hackernews", label: "Hacker News", enabledByDefault: true, limit: 6, fetcher: fetchHackerNewsItems },
];

export type SourceRuntimeConfig = {
  enabled?: SourceKey[];
  disabled?: SourceKey[];
  limits?: Partial<Record<SourceKey, number>>;
};

async function readRemoteConfig(): Promise<SourceRuntimeConfig | null> {
  const url = process.env.ABSURDITY_SOURCE_CONFIG_URL;
  if (!url) return null;
  try {
    return await fetchJson<SourceRuntimeConfig>(url);
  } catch {
    return null;
  }
}

function readEnvConfig(): SourceRuntimeConfig {
  const enabled = process.env.ABSURDITY_ENABLED_SOURCES?.split(",").map((s) => s.trim()).filter(Boolean) as SourceKey[] | undefined;
  const disabled = process.env.ABSURDITY_DISABLED_SOURCES?.split(",").map((s) => s.trim()).filter(Boolean) as SourceKey[] | undefined;
  const limitsRaw = process.env.ABSURDITY_SOURCE_LIMITS;
  let limits: SourceRuntimeConfig["limits"] | undefined;
  if (limitsRaw) {
    try {
      limits = JSON.parse(limitsRaw) as SourceRuntimeConfig["limits"];
    } catch {
      limits = undefined;
    }
  }
  return { enabled, disabled, limits };
}

export async function getSourceRegistry() {
  const remoteConfig = await readRemoteConfig();
  const envConfig = readEnvConfig();
  const enabledSet = new Set<SourceKey>(remoteConfig?.enabled ?? envConfig.enabled ?? []);
  const disabledSet = new Set<SourceKey>([...(remoteConfig?.disabled ?? []), ...(envConfig.disabled ?? [])]);
  const limits = { ...(remoteConfig?.limits ?? {}), ...(envConfig.limits ?? {}) };

  return DEFAULT_SOURCE_REGISTRY.map((item) => {
    const enabled = enabledSet.size > 0 ? enabledSet.has(item.key) : item.enabledByDefault;
    return {
      ...item,
      enabled: enabled && !disabledSet.has(item.key),
      limit: limits[item.key] ?? item.limit,
    };
  });
}
