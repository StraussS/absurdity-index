import { cheerio, fetchText, toAbsurdityItems, SourceSeedItem } from "@/lib/source-utils";

const KR_NEWSFLASH_URL = "https://www.36kr.com/newsflashes";

function parse36KrItems(html: string): SourceSeedItem[] {
  const $ = cheerio.load(html);
  const items: SourceSeedItem[] = [];
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

export async function fetch36KrItems(limit = 8) {
  const html = await fetchText(KR_NEWSFLASH_URL);
  return toAbsurdityItems(parse36KrItems(html).slice(0, limit), "kr");
}
