import fallbackToday from "@/data/today.json";
import { DailyAbsurdity, buildDailySummary } from "@/lib/absurdity";
import { dedupeAbsurdityItems } from "@/lib/dedupe";
import { loadRecentHistory, mergeTrendFromHistory, saveDailySnapshot } from "@/lib/history";
import { getSourceRegistry } from "@/lib/source-registry";
import { generateShareCard } from "@/lib/share-card";

export type SourceRunMetric = {
  key: string;
  label: string;
  enabled: boolean;
  requested_limit: number;
  ok: boolean;
  fetched_count: number;
  error?: string;
};

export type PipelineMetrics = {
  mode: "live" | "fallback";
  sources: SourceRunMetric[];
  enabled_sources: number;
  merged_count: number;
  deduped_count: number;
  final_count: number;
  ai_count: number;
  cache_count: number;
  rule_count: number;
  multi_source_count: number;
  generated_at: string;
};

export async function runTodayPipeline(): Promise<{ data: DailyAbsurdity; metrics: PipelineMetrics }> {
  const generatedAt = new Date().toISOString();
  try {
    const registry = await getSourceRegistry();
    const activeSources = registry.filter((item) => item.enabled);

    const settled = await Promise.allSettled(
      activeSources.map(async (source) => {
        const items = await source.fetcher(source.limit);
        return { source, items };
      }),
    );

    const sourceMetrics: SourceRunMetric[] = activeSources.map((source, index) => {
      const result = settled[index];
      if (result.status === "fulfilled") {
        return {
          key: source.key,
          label: source.label,
          enabled: true,
          requested_limit: source.limit,
          ok: true,
          fetched_count: result.value.items.length,
        };
      }
      return {
        key: source.key,
        label: source.label,
        enabled: true,
        requested_limit: source.limit,
        ok: false,
        fetched_count: 0,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      };
    });

    const merged = settled
      .flatMap((result) => (result.status === "fulfilled" ? result.value.items : []))
      .filter(Boolean);

    const deduped = dedupeAbsurdityItems(merged).sort((a, b) => b.score - a.score);
    const finalItems = deduped.slice(0, 10);

    if (finalItems.length === 0) {
      return {
        data: fallbackToday as DailyAbsurdity,
        metrics: {
          mode: "fallback",
          sources: sourceMetrics,
          enabled_sources: activeSources.length,
          merged_count: merged.length,
          deduped_count: deduped.length,
          final_count: 0,
          ai_count: 0,
          cache_count: 0,
          rule_count: 0,
          multi_source_count: 0,
          generated_at: generatedAt,
        },
      };
    }

    const summary = buildDailySummary(finalItems);
    const current: DailyAbsurdity = {
      date: new Date().toISOString().slice(0, 10),
      ...summary,
      top_items: finalItems,
    };

    const history = await loadRecentHistory(7);
    current.trend = mergeTrendFromHistory(current, history);
    const share = await generateShareCard(current);
    await saveDailySnapshot(current, { share_image: share.publicPath });

    return {
      data: current,
      metrics: {
        mode: "live",
        sources: sourceMetrics,
        enabled_sources: activeSources.length,
        merged_count: merged.length,
        deduped_count: deduped.length,
        final_count: finalItems.length,
        ai_count: finalItems.filter((item) => item.scoring_mode === "ai").length,
        cache_count: finalItems.filter((item) => item.scoring_mode === "cache").length,
        rule_count: finalItems.filter((item) => (item.scoring_mode ?? "rule") === "rule").length,
        multi_source_count: finalItems.filter((item) => (item.source_count ?? 1) > 1).length,
        generated_at: generatedAt,
      },
    };
  } catch (error) {
    console.error("Failed to fetch live sources, using fallback data.", error);
    return {
      data: fallbackToday as DailyAbsurdity,
      metrics: {
        mode: "fallback",
        sources: [],
        enabled_sources: 0,
        merged_count: 0,
        deduped_count: 0,
        final_count: 0,
        ai_count: 0,
        cache_count: 0,
        rule_count: 0,
        multi_source_count: 0,
        generated_at: generatedAt,
      },
    };
  }
}
