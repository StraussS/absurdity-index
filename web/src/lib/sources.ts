import * as cheerio from "cheerio";
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
const BAIDU_REALTIME_URL = "https://top.baidu.com/board?tab=realtime";
const WEIBO_URL = "https://s.weibo.com/top/summary?cate=realtimehot";
const ITHOME_LIST_URL = "https://www.ithome.com/list/";
const KR_NEWSFLASH_URL = "https://www.36kr.com/newsflashes";

const RSS_SOURCES = [
  {
    name: "Google News 中文",
    url: "https://news.google.com/rss?hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
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

function parseIthomeItems(html: string): RssItem[] {
  const $ = cheerio.load(html);
  const items: RssItem[] = [];
  $("#list > div.fl > ul > li").each((_, el) => {
    const anchor = $(el).find("a.t").first();
    const href = anchor.attr("href")?.trim();
    const title = anchor.text().trim();
    const date = $(el).find("i").text().trim();
    const isAd = href?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].some((k) => title.includes(k));
    if (href && title && !isAd) {
      items.push({
        title,
        link: href.startsWith("http") ? href : `https:${href}`,
        pubDate: date,
        source: "IT之家",
      });
    }
  });
  return items;
}

function parse36KrItems(html: string): RssItem[] {
  const $ = cheerio.load(html);
  const items: RssItem[] = [];
  $(".newsflash-item").each((_, el) => {
    const anchor = $(el).find("a.item-title").first();
    const href = anchor.attr("href")?.trim();
    const title = anchor.text().trim();
    const date = $(el).find(".time").text().trim();
    if (href && title) {
      items.push({
        title,
        link: href.startsWith("http") ? href : `https://www.36kr.com${href}`,
        pubDate: date,
        source: "36氪",
      });
    }
  });
  return items;
}

function parseWeiboItems(html: string): RssItem[] {
  const $ = cheerio.load(html);
  const items: RssItem[] = [];
  $("#pl_top_realtimehot table tbody tr").slice(1).each((_, row) => {
    const link = $(row)
      .find("td.td-02 a")
      .filter((_, el) => {
        const href = $(el).attr("href");
        return Boolean(href && !href.includes("javascript:void(0);"));
      })
      .first();
    const title = link.text().trim();
    const href = link.attr("href")?.trim();
    if (title && href) {
      items.push({
        title,
        link: href.startsWith("http") ? href : `https://s.weibo.com${href}`,
        source: "微博热搜",
      });
    }
  });
  return items;
}

function formatTime(input?: string | number) {
  if (!input) return "--:--";
  if (typeof input === "string" && /^(\d{1,2}:\d{1,2}|\d+分钟前|\d+小时前|刚刚|今天)/.test(input)) {
    return input;
  }
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input).slice(0, 10) || "--:--";
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

async function fetchText(url: string, init?: RequestInit): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      accept: "application/rss+xml, application/xml, text/xml, text/html, text/plain, */*",
      ...(init?.headers ?? {}),
    },
    ...init,
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

function toAbsurdityItems(items: RssItem[], prefix: string): AbsurdityItem[] {
  return items.map((item, index) => {
    const scored = scoreTitle(item.title);
    return {
      id: `${prefix}-${index}-${Buffer.from(item.title).toString("base64").slice(0, 8)}`,
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

async function fetchRssSourceItems(limitPerFeed = 3): Promise<AbsurdityItem[]> {
  const xmlList = await Promise.all(RSS_SOURCES.map(async (feed) => ({ feed, xml: await fetchText(feed.url) })));
  const rssItems = xmlList.flatMap(({ feed, xml }) => parseRssItems(xml, feed.name).slice(0, limitPerFeed));
  return toAbsurdityItems(rssItems, "rss");
}

async function fetchBaiduHotItems(limit = 8): Promise<AbsurdityItem[]> {
  const html = await fetchText(BAIDU_REALTIME_URL);
  return toAbsurdityItems(parseBaiduHotItems(html).slice(0, limit), "baidu");
}

async function fetchIthomeItems(limit = 8): Promise<AbsurdityItem[]> {
  const html = await fetchText(ITHOME_LIST_URL);
  return toAbsurdityItems(parseIthomeItems(html).slice(0, limit), "ithome");
}

async function fetch36KrItems(limit = 8): Promise<AbsurdityItem[]> {
  const html = await fetchText(KR_NEWSFLASH_URL);
  return toAbsurdityItems(parse36KrItems(html).slice(0, limit), "kr");
}

async function fetchWeiboItems(limit = 10): Promise<AbsurdityItem[]> {
  const cookie = process.env.WEIBO_COOKIE;
  if (!cookie) return [];
  const html = await fetchText(WEIBO_URL, {
    headers: {
      cookie,
      referer: WEIBO_URL,
    },
  });
  return toAbsurdityItems(parseWeiboItems(html).slice(0, limit), "weibo");
}

export async function getTodayData(): Promise<DailyAbsurdity> {
  try {
    const [hnItems, rssItems, baiduItems, ithomeItems, krItems, weiboItems] = await Promise.all([
      fetchHackerNewsItems(6),
      fetchRssSourceItems(2),
      fetchBaiduHotItems(8),
      fetchIthomeItems(6),
      fetch36KrItems(6),
      fetchWeiboItems(10),
    ]);

    const merged = [...weiboItems, ...baiduItems, ...ithomeItems, ...krItems, ...rssItems, ...hnItems]
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
