import fallbackToday from "@/data/today.json";
import { DailyAbsurdity, buildDailySummary } from "@/lib/absurdity";
import { dedupeAbsurdityItems } from "@/lib/dedupe";
import { getSourceRegistry } from "@/lib/source-registry";

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
      .slice(0, 5);

    if (deduped.length === 0) {
      return fallbackToday as DailyAbsurdity;
    }

    const summary = buildDailySummary(deduped);
    return {
      date: new Date().toISOString().slice(0, 10),
      ...summary,
      top_items: deduped,
    };
  } catch (error) {
    console.error("Failed to fetch live sources, using fallback data.", error);
    return fallbackToday as DailyAbsurdity;
  }
}
