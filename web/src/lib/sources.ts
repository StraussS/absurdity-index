import fallbackToday from "@/data/today.json";
import { DailyAbsurdity, buildDailySummary } from "@/lib/absurdity";
import { fetchBaiduItems } from "@/lib/sources/baidu";
import { fetch36KrItems } from "@/lib/sources/kr36";
import { fetchHackerNewsItems } from "@/lib/sources/hackernews";
import { fetchIthomeItems } from "@/lib/sources/ithome";
import { fetchRssSourceItems } from "@/lib/sources/rss";
import { fetchSspaiItems } from "@/lib/sources/sspai";
import { fetchTencentItems } from "@/lib/sources/tencent";
import { fetchThePaperItems } from "@/lib/sources/thepaper";
import { fetchToutiaoItems } from "@/lib/sources/toutiao";
import { fetchWallstreetcnItems } from "@/lib/sources/wallstreetcn";
import { fetchWeiboItems } from "@/lib/sources/weibo";

export async function getTodayData(): Promise<DailyAbsurdity> {
  try {
    const [hnItems, rssItems, baiduItems, ithomeItems, krItems, weiboItems, thepaperItems, wallstreetcnItems, toutiaoItems, sspaiItems, tencentItems] = await Promise.all([
      fetchHackerNewsItems(6),
      fetchRssSourceItems(2),
      fetchBaiduItems(8),
      fetchIthomeItems(6),
      fetch36KrItems(6),
      fetchWeiboItems(10),
      fetchThePaperItems(6),
      fetchWallstreetcnItems(6),
      fetchToutiaoItems(6),
      fetchSspaiItems(6),
      fetchTencentItems(6),
    ]);

    const merged = [
      ...weiboItems,
      ...baiduItems,
      ...ithomeItems,
      ...krItems,
      ...thepaperItems,
      ...wallstreetcnItems,
      ...toutiaoItems,
      ...sspaiItems,
      ...tencentItems,
      ...rssItems,
      ...hnItems,
    ]
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
