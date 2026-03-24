import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { AbsurdityItem } from "@/lib/absurdity";
import { scoreSeedItems } from "@/lib/ai-scoring";

export type SourceSeedItem = {
  title: string;
  link: string;
  source: string;
  pubDate?: string | number;
  originalTitle?: string;
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

const TRANSLATION_CACHE_DIR = path.join(process.cwd(), "data", "translation-cache");

function looksLikeTechnicalMemeTitle(title: string) {
  return /(curl\s*>\s*\/dev\/sda|wget\s*\|\s*dd|rm\s+-rf|\bShow HN\b|\bAsk HN\b|\bLaunch HN\b|\|\s*dd\b)/i.test(title);
}

function isPublicFriendlyTitle(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return false;
  if (looksLikeTechnicalMemeTitle(trimmed)) return false;
  return true;
}

function looksNonChineseTitle(title: string) {
  const hasChinese = /[\u4e00-\u9fff]/.test(title);
  const hasLatin = /[A-Za-z]/.test(title);
  return !hasChinese && hasLatin;
}

function translationCachePath(seed: SourceSeedItem) {
  const key = createHash("sha1").update(`${seed.source}\n${seed.title}`).digest("hex");
  return path.join(TRANSLATION_CACHE_DIR, `${key}.json`);
}

async function loadTranslationCache(seed: SourceSeedItem) {
  try {
    const raw = await readFile(translationCachePath(seed), "utf8");
    const parsed = JSON.parse(raw) as { translated_title?: string };
    return parsed.translated_title?.trim() || null;
  } catch {
    return null;
  }
}

async function saveTranslationCache(seed: SourceSeedItem, translatedTitle: string) {
  await mkdir(TRANSLATION_CACHE_DIR, { recursive: true });
  await writeFile(
    translationCachePath(seed),
    JSON.stringify({ source: seed.source, title: seed.title, translated_title: translatedTitle }, null, 2),
    "utf8",
  );
}

async function translateTitle(seed: SourceSeedItem) {
  if (!looksNonChineseTitle(seed.title)) return seed;

  const cached = await loadTranslationCache(seed);
  if (cached) {
    return { ...seed, originalTitle: seed.title, title: cached };
  }

  const baseUrl = process.env.AI_SCORING_BASE_URL;
  const apiKey = process.env.AI_SCORING_API_KEY;
  const model = process.env.AI_SCORING_MODEL;
  if (!baseUrl || !apiKey || !model) return seed;

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: [
              "你是新闻标题翻译编辑。",
              "把英文新闻标题翻译成自然、简洁、适合中文资讯站展示的中文标题。",
              "不要解释，不要加评论，不要扩写，不要保留英文括号补充。",
              "专有名词按常见中文译法处理。",
              "只输出 JSON。格式：{\"title_zh\":\"中文标题\"}",
            ].join("\n"),
          },
          {
            role: "user",
            content: JSON.stringify({ source: seed.source, title: seed.title }),
          },
        ],
      }),
    });

    if (!response.ok) return seed;
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as { title_zh?: string };
    const titleZh = parsed.title_zh?.trim();
    if (!titleZh) return seed;
    await saveTranslationCache(seed, titleZh);
    return { ...seed, originalTitle: seed.title, title: titleZh };
  } catch {
    return seed;
  }
}

export async function toAbsurdityItems(items: SourceSeedItem[], prefix: string): Promise<AbsurdityItem[]> {
  const filtered = items.filter((item) => isPublicFriendlyTitle(item.title));
  const translated = await Promise.all(filtered.map((item) => translateTitle(item)));
  return scoreSeedItems(translated, prefix);
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
