import { fetchJson, toAbsurdityItems, SourceSeedItem } from "@/lib/source-utils";

const WEIBO_API_URL = process.env.WEIBO_API_URL || "";

type WeiboApiResponse = {
  code?: number;
  message?: string;
  data?: Array<{
    title?: string;
    hot_value?: number;
    link?: string;
  }>;
};

function parseWeiboItems(payload: WeiboApiResponse): SourceSeedItem[] {
  return (payload.data ?? [])
    .map((item) => ({
      title: item.title?.trim() ?? "",
      link: item.link?.trim() ?? "",
      source: "微博热搜",
      pubDate: item.hot_value ? `热度 ${item.hot_value}` : undefined,
    }))
    .filter((item) => item.title && item.link);
}

export async function fetchWeiboItems(limit = 10) {
  if (!WEIBO_API_URL) {
    return [];
  }

  const payload = await fetchJson<WeiboApiResponse>(WEIBO_API_URL);
  return toAbsurdityItems(parseWeiboItems(payload).slice(0, limit), "weibo");
}
