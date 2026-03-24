import fallbackToday from "@/data/today.json";
import { AbsurdityItem, DailyAbsurdity, buildDailySummary, scoreTitle } from "@/lib/absurdity";

type HNItem = {
  id: number;
  title?: string;
  url?: string;
  time?: number;
};

type RssItem = {
  title: string;
  link: string;
  pubDate?: string;
  source: string;
};

const HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_URL = (id: number) => `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
const RSS_SOURCES = [
  {
    name: "Google News Tech",
    url: "https://news.google.com/rss/search?q=AI%20OR%20technology%20OR%20platform&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News World",
    url: "https://news.google.com/rss/search?q=weird%20OR%20bizarre%20OR%20surprising&hl=en-US&gl=US&ceid=US:en",
  },
];

function stripTags(input: string) {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseRssItems(xml: string, source: string): RssItem[] {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  return items
    .map((match) => {
      const body = match[1];
      const title = body.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const link = body.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "";
      const pubDate = body.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? "";
      return {
        title: stripTags(title),
        link: stripTags(link),
        pubDate: stripTags(pubDate),
        source,
      };
    })
    .filter((item) => item.title && item.link);
}

function formatTime(input?: string | number) {
  if (!input) return "--:--";
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "absurdity-index/0.1 (+https://example.com)",
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<T>;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "absurdity-index/0.1 (+https://example.com)",
      accept: "application/rss+xml, application/xml, text/xml, text/plain, */*",
    },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`);
  }
  return response.text();
}

async function fetchHackerNewsItems(limit = 5): Promise<AbsurdityItem[]> {
  const ids = await fetchJson<number[]>(HN_TOP_URL);
  const items = await Promise.all(ids.slice(0, limit).map((id) => fetchJson<HNItem>(HN_ITEM_URL(id))));

  return items
    .filter((item): item is HNItem & { title: string } => Boolean(item?.title))
    .map((item) => {
      const scored = scoreTitle(item.title);
      return {
        id: `hn-${item.id}`,
        title: item.title,
        source: "Hacker News",
        time: formatTime(item.time),
        category: scored.categories,
        score: scored.score,
        comment: scored.comment,
        reason: scored.reason,
        dimensions: scored.dimensions,
        url: item.url ?? `https://news.ycombinator.com/item?id=${item.id}`,
      } satisfies AbsurdityItem;
    });
}

async function fetchRssSourceItems(limitPerFeed = 4): Promise<AbsurdityItem[]> {
  const xmlList = await Promise.all(RSS_SOURCES.map(async (feed) => ({ feed, xml: await fetchText(feed.url) })));
  const rssItems = xmlList.flatMap(({ feed, xml }) => parseRssItems(xml, feed.name).slice(0, limitPerFeed));

  return rssItems.map((item, index) => {
    const scored = scoreTitle(item.title);
    return {
      id: `rss-${index}-${Buffer.from(item.title).toString("base64").slice(0, 8)}`,
      title: item.title,
      source: item.source,
      time: formatTime(item.pubDate),
      category: scored.categories,
      score: scored.score,
      comment: scored.comment,
      reason: scored.reason,
      dimensions: scored.dimensions,
      url: item.link,
    } satisfies AbsurdityItem;
  });
}

export async function getTodayData(): Promise<DailyAbsurdity> {
  try {
    const [hnItems, rssItems] = await Promise.all([fetchHackerNewsItems(6), fetchRssSourceItems(3)]);
    const merged = [...hnItems, ...rssItems]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    if (merged.length === 0) {
      return fallbackToday as DailyAbsurdity;
    }

    const summary = buildDailySummary(merged);
    return {
      date: new Date().toISOString().slice(0, 10),
      ...summary,
      top_items: merged,
    };
  } catch (error) {
    console.error("Failed to fetch live sources, using fallback data.", error);
    return fallbackToday as DailyAbsurdity;
  }
}
