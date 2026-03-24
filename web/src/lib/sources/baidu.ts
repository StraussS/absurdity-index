import { fetchText, toAbsurdityItems, SourceSeedItem } from "@/lib/source-utils";

const BAIDU_REALTIME_URL = "https://top.baidu.com/board?tab=realtime";

function parseBaiduHotItems(html: string): SourceSeedItem[] {
  const marker = "<!--s-data:";
  const start = html.indexOf(marker);
  if (start === -1) return [];
  const end = html.indexOf("-->", start);
  if (end === -1) return [];

  const payload = html.slice(start + marker.length, end);
  try {
    const parsed = JSON.parse(payload) as {
      data?: { cards?: Array<{ component?: string; content?: Array<{ word?: string; url?: string; rawUrl?: string; isTop?: boolean }> }> };
    };
    const card = parsed.data?.cards?.find((item) => item.component === "hotList");
    return (card?.content ?? [])
      .filter((item) => item.word && (item.rawUrl || item.url) && !item.isTop)
      .map((item) => ({
        title: item.word as string,
        link: (item.rawUrl || item.url) as string,
        source: "百度热搜",
      }));
  } catch {
    return [];
  }
}

export async function fetchBaiduItems(limit = 8) {
  const html = await fetchText(BAIDU_REALTIME_URL);
  return toAbsurdityItems(parseBaiduHotItems(html).slice(0, limit), "baidu");
}
