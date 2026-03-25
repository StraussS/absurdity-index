import { AbsurdityItem } from "@/lib/absurdity";

const STOPWORDS = /热搜|头条|突发|最新|回应|的|了|在|与|和|将|已|就|被|对|因|后|称|系|为|这|那/g;

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[【】\[\]()（）“”"'‘’]/g, "")
    .replace(/[#：:·•,，。！？!?.、\-|_]/g, " ")
    .replace(/\s+/g, " ")
    .replace(STOPWORDS, " ")
    .trim();
}

function titleTokens(title: string) {
  return Array.from(new Set(normalizeTitle(title).split(" ").filter(Boolean)));
}

function overlapRatio(a: string[], b: string[]) {
  if (a.length === 0 || b.length === 0) return 0;
  const bSet = new Set(b);
  const overlap = a.filter((token) => bSet.has(token)).length;
  return overlap / Math.max(Math.min(a.length, b.length), 1);
}

function containsLongSharedPhrase(a: string, b: string) {
  const na = normalizeTitle(a).replace(/\s+/g, " ");
  const nb = normalizeTitle(b).replace(/\s+/g, " ");
  if (!na || !nb) return false;
  const shorter = na.length <= nb.length ? na : nb;
  const longer = shorter === na ? nb : na;

  for (let len = Math.min(12, shorter.length); len >= 6; len -= 1) {
    for (let i = 0; i <= shorter.length - len; i += 1) {
      const part = shorter.slice(i, i + len).trim();
      if (part.length >= 6 && longer.includes(part)) return true;
    }
  }
  return false;
}

function sameEvent(a: AbsurdityItem, b: AbsurdityItem) {
  const ta = titleTokens(a.title);
  const tb = titleTokens(b.title);
  const normalizedEqual = normalizeTitle(a.title) === normalizeTitle(b.title);
  const highOverlap = overlapRatio(ta, tb) >= 0.72;
  const sharedPhrase = containsLongSharedPhrase(a.title, b.title);
  return normalizedEqual || highOverlap || sharedPhrase;
}

function mergedScoringMode(base: AbsurdityItem, candidate: AbsurdityItem) {
  const order = { ai: 3, cache: 2, rule: 1 } as const;
  const baseMode = base.scoring_mode ?? "rule";
  const candidateMode = candidate.scoring_mode ?? "rule";
  return order[candidateMode] > order[baseMode] ? candidateMode : baseMode;
}

function mergeItems(base: AbsurdityItem, candidate: AbsurdityItem): AbsurdityItem {
  const mergedSources = Array.from(new Set([...(base.sources ?? [base.source]), ...(candidate.sources ?? [candidate.source])])).sort();
  const mergedCategories = Array.from(new Set([...base.category, ...candidate.category])).slice(0, 4);
  const better = candidate.score > base.score ? candidate : base;

  return {
    ...better,
    source: better.source,
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
    const existingIndex = result.findIndex((existing) => sameEvent(existing, item));

    if (existingIndex === -1) {
      result.push(item);
    } else {
      result[existingIndex] = mergeItems(result[existingIndex], item);
    }
  }

  return result;
}
