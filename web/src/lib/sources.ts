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
    name: "Google News 中文",
    url: "https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
  },
  {
    name: "IT之家",
    url: "https://www.ithome.com/rss/",
  },
  {
    name: "36氪",
    url: "https://36kr.com/feed",
  },
  {
    name: "Google News Tech",
    url: "https://news.google.com/rss/search?q=AI%20OR%20technology%20OR%20platform&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News World",
    url: "https://news.google.com/rss/search?q=weird%20OR%20bizarre%20OR%20surprising&hl=en-US&gl=US&ceid=US:en",
  },
];

const BAIDU_REALTIME_URL = "https://top.baidu.com/board?tab=realtime";

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
  const itemMatches = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  const entryMatches = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
  const blocks = itemMatches.length > 0 ? itemMatches.map((m) => m[1]) : entryMatches.map((m) => m[1]);

  return blocks
    .map((body) => {
      const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1] ?? "";
      const itemLink = body.match(/<link>([\s\S]*?)<\/link>/)?.[1] ?? "";
      const atomLink = body.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?>(?:<\/link>)?/i)?.[1] ?? "";
      const pubDate = body.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] ?? body.match(/<updated>([\s\S]*?)<\/updated>/)?.[1] ?? "";
      return {
        title: stripTags(title),
        link: stripTags(itemLink || atomLink),
        pubDate: stripTags(pubDate),
        source,
      };
    })
    .filter((item) => item.title && item.link);
}

function parseBaiduHotItems(html: string): RssItem[] {
  const marker = '<!--s-data:';
  const start = html.indexOf(marker);
  if (start === -1) return [];
  const end = html.indexOf('-->', start);
  if (end === -1) return [];

  const payload = html.slice(start + marker.length, end);
  try {
    const parsed = JSON.parse(payload) as {
      data?: { cards?: Array<{ component?: string; content?: Array<{ word?: string; url?: string }> }> };
    };
    const card = parsed.data?.cards?.find((item) => item.component === 'hotList');
    return (card?.content ?? [])
      .filter((item) => item.word && item.url)
      .map((item) => ({
        title: item.word as string,
        link: item.url as string,
        source: '百度热搜',
      }));
  } catch {
    return [];
  }
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

async function fetchBaiduHotItems(limit = 8): Promise<AbsurdityItem[]> {
  const html = await fetchText(BAIDU_REALTIME_URL);
  const items = parseBaiduHotItems(html).slice(0, limit);
  return items.map((item, index) => {
    const scored = scoreTitle(item.title);
    return {
      id: `baidu-${index}-${Buffer.from(item.title).toString("base64").slice(0, 8)}`,
      title: item.title,
      source: item.source,
      time: formatTime(),
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
    const [hnItems, rssItems, baiduItems] = await Promise.all([
      fetchHackerNewsItems(6),
      fetchRssSourceItems(3),
      fetchBaiduHotItems(8),
    ]);
    const merged = [...baiduItems, ...rssItems, ...hnItems]
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
