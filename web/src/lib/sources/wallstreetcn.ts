import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface LiveItem {
  uri: string;
  id: number;
  title?: string;
  content_text: string;
  display_time: number;
}

interface LiveRes {
  data: { items: LiveItem[] };
}

export async function fetchWallstreetcnItems(limit = 8) {
  const url = "https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30";
  const res = await fetchJson<LiveRes>(url);
  return toAbsurdityItems(
    res.data.items.slice(0, limit).map((item) => ({
      title: item.title || item.content_text,
      link: item.uri,
      pubDate: item.display_time * 1000,
      source: "华尔街见闻",
    })),
    "wallstreetcn",
  );
}
