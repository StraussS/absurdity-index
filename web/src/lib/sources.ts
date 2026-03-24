import fallbackToday from "@/data/today.json";
import { DailyAbsurdity, buildDailySummary } from "@/lib/absurdity";
import { dedupeAbsurdityItems } from "@/lib/dedupe";
import { loadRecentHistory, mergeTrendFromHistory, saveDailySnapshot } from "@/lib/history";
import { getSourceRegistry } from "@/lib/source-registry";
import { generateShareCard } from "@/lib/share-card";

export async function getTodayData(): Promise<DailyAbsurdity> {
  try {
    const registry = await getSourceRegistry();
    const activeSources = registry.filter((item) => item.enabled);

    const settled = await Promise.allSettled(
      activeSources.map(async (source) => {
        const items = await source.fetcher(source.limit);
        return items;
      }),
    );

    const merged = settled
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .filter(Boolean);

    const deduped = dedupeAbsurdityItems(merged)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (deduped.length === 0) {
      return fallbackToday as DailyAbsurdity;
    }

    const summary = buildDailySummary(deduped);
    const current: DailyAbsurdity = {
      date: new Date().toISOString().slice(0, 10),
      ...summary,
      top_items: deduped,
    };

    const history = await loadRecentHistory(7);
    current.trend = mergeTrendFromHistory(current, history);
    const share = await generateShareCard(current);
    await saveDailySnapshot(current, { share_image: share.publicPath });
    return current;
  } catch (error) {
    console.error("Failed to fetch live sources, using fallback data.", error);
    return fallbackToday as DailyAbsurdity;
  }
}
