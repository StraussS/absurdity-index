import * as cheerio from "cheerio";
import { AbsurdityItem } from "@/lib/absurdity";
import { scoreTitle } from "@/lib/absurdity";

export type SourceSeedItem = {
  title: string;
  link: string;
  source: string;
  pubDate?: string | number;
};

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${url}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchText(url: string, init?: RequestInit): Promise<string> {
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

export function stripTags(input: string) {
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function formatTime(input?: string | number) {
  if (!input) return "--:--";
  if (typeof input === "string" && /^(\d{1,2}:\d{1,2}|\d+分钟前|\d+小时前|刚刚|今天)/.test(input)) {
    return input;
  }
  const date = typeof input === "number" ? new Date(input * 1000) : new Date(input);
  if (Number.isNaN(date.getTime())) return String(input).slice(0, 10) || "--:--";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function toAbsurdityItems(items: SourceSeedItem[], prefix: string): AbsurdityItem[] {
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

export function parseRssItems(xml: string, source: string): SourceSeedItem[] {
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

export { cheerio };
