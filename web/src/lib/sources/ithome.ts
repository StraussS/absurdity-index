import { cheerio, fetchText, toAbsurdityItems, SourceSeedItem } from "@/lib/source-utils";

const ITHOME_LIST_URL = "https://www.ithome.com/list/";

function parseIthomeItems(html: string): SourceSeedItem[] {
  const $ = cheerio.load(html);
  const items: SourceSeedItem[] = [];
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

export async function fetchIthomeItems(limit = 8) {
  const html = await fetchText(ITHOME_LIST_URL);
  return toAbsurdityItems(parseIthomeItems(html).slice(0, limit), "ithome");
}
