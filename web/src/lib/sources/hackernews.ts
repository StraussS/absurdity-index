import { fetchJson, toAbsurdityItems } from "@/lib/source-utils";

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  time?: number;
}

const HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;

export async function fetchHackerNewsItems(limit = 6) {
  const ids = await fetchJson<number[]>(HN_TOP_URL);
  const items = await Promise.all(ids.slice(0, limit).map((id) => fetchJson<HNItem>(HN_ITEM_URL(id))));
  return toAbsurdityItems(
    items
      .filter((item): item is HNItem & { title: string } => Boolean(item?.title))
      .map((item) => ({
        title: item.title,
        link: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
        pubDate: item.time,
        source: "Hacker News",
      })),
    "hn",
  );
}
