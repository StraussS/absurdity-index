import { AbsurdityItem } from "@/lib/absurdity";

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[【】\[\]()（）“”"'‘’]/g, "")
    .replace(/[#：:·•,，。！？!?.、\-|_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/热搜|头条|突发|最新|回应|的|了|在|与|和/g, " ")
    .trim();
}

function titleTokens(title: string) {
  return Array.from(new Set(normalizeTitle(title).split(" ").filter(Boolean)));
}

function similarity(a: string, b: string) {
  const ta = titleTokens(a);
  const tb = titleTokens(b);
  if (ta.length === 0 || tb.length === 0) return 0;
  const bSet = new Set(tb);
  const overlap = ta.filter((token) => bSet.has(token)).length;
  return overlap / Math.max(Math.min(ta.length, tb.length), 1);
}

function mergedScoringMode(base: AbsurdityItem, candidate: AbsurdityItem) {
  const order = { ai: 3, cache: 2, rule: 1 } as const;
  const baseMode = base.scoring_mode ?? "rule";
  const candidateMode = candidate.scoring_mode ?? "rule";
  return order[candidateMode] > order[baseMode] ? candidateMode : baseMode;
}

function mergeItems(base: AbsurdityItem, candidate: AbsurdityItem): AbsurdityItem {
  const mergedSources = Array.from(new Set([...(base.sources ?? [base.source]), ...(candidate.sources ?? [candidate.source])]));
  const mergedCategories = Array.from(new Set([...base.category, ...candidate.category])).slice(0, 4);
  const better = candidate.score > base.score ? candidate : base;

  return {
    ...better,
    source: mergedSources.join(" / "),
    sources: mergedSources,
    source_count: mergedSources.length,
    category: mergedCategories,
    score: Math.max(base.score, candidate.score),
    scoring_mode: mergedScoringMode(base, candidate),
  };
}

export function dedupeAbsurdityItems(items: AbsurdityItem[]) {
  const sorted = [...items].sort((a, b) => b.score - a.score);
  const result: AbsurdityItem[] = [];

  for (const item of sorted) {
    const existingIndex = result.findIndex((existing) => {
      const normalizedEqual = normalizeTitle(existing.title) === normalizeTitle(item.title);
      const similar = similarity(existing.title, item.title) >= 0.66;
      return normalizedEqual || similar;
    });

    if (existingIndex === -1) {
      result.push(item);
    } else {
      result[existingIndex] = mergeItems(result[existingIndex], item);
    }
  }

  return result;
}
