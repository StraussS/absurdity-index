import { fetchText, parseRssItems, toAbsurdityItems } from "@/lib/source-utils";

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

export async function fetchRssSourceItems(limitPerFeed = 2) {
  const xmlList = await Promise.all(RSS_SOURCES.map(async (feed) => ({ feed, xml: await fetchText(feed.url) })));
  const rssItems = xmlList.flatMap(({ feed, xml }) => parseRssItems(xml, feed.name).slice(0, limitPerFeed));
  return toAbsurdityItems(rssItems, "rss");
}
