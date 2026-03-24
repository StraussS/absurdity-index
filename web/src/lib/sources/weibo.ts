import { cheerio, fetchText, toAbsurdityItems, SourceSeedItem } from "@/lib/source-utils";

const WEIBO_URL = "https://s.weibo.com/top/summary?cate=realtimehot";

function parseWeiboItems(html: string): SourceSeedItem[] {
  const $ = cheerio.load(html);
  const items: SourceSeedItem[] = [];
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

export async function fetchWeiboItems(limit = 10) {
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
