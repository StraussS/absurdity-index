export type AbsurdityDimensions = {
  反常识: number;
  黑色幽默: number;
  系统性离谱: number;
  传播戏剧性: number;
  赛博浓度: number;
};

export type AbsurdityItem = {
  id: string;
  title: string;
  source: string;
  time: string;
  category: string[];
  score: number;
  comment: string;
  reason: string;
  dimensions: AbsurdityDimensions;
  url: string;
};

export type DailyAbsurdity = {
  date: string;
  daily_index: number;
  level: string;
  summary: string;
  keywords: string[];
  top_items: AbsurdityItem[];
  trend: number[];
};

const keywordRules = [
  { pattern: /(ai|人工智能|算法|模型|自动化|机器人|chatgpt|agent)/i, score: 16, tags: ["AI", "赛博流程"] },
  { pattern: /(监控|审核|审批|流程|平台|规则|系统|机制)/i, score: 14, tags: ["平台", "系统性离谱"] },
  { pattern: /(热搜|爆火|疯传|争议|网友|刷屏)/i, score: 10, tags: ["传播事件"] },
  { pattern: /(公司|员工|老板|职场|裁员|考勤)/i, score: 10, tags: ["职场"] },
  { pattern: /(奇葩|离谱|荒谬|尴尬|魔幻|反转)/i, score: 12, tags: ["魔幻现实"] },
  { pattern: /(安全|封禁|禁令|法院|警方|政府|监管)/i, score: 8, tags: ["制度"] },
];

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: number) {
  return items[seed % items.length];
}

export function scoreTitle(title: string) {
  let base = 42;
  const categories = new Set<string>();

  for (const rule of keywordRules) {
    if (rule.pattern.test(title)) {
      base += rule.score;
      rule.tags.forEach((tag) => categories.add(tag));
    }
  }

  const seed = hashString(title);
  const dimensions: AbsurdityDimensions = {
    反常识: clamp(base + (seed % 9)),
    黑色幽默: clamp(base - 8 + ((seed >> 2) % 18)),
    系统性离谱: clamp(base + 6 + ((seed >> 3) % 16)),
    传播戏剧性: clamp(base - 4 + ((seed >> 1) % 20)),
    赛博浓度: clamp(base - 10 + ((seed >> 4) % 26)),
  };

  const score = Math.round(
    dimensions.反常识 * 0.25 +
      dimensions.黑色幽默 * 0.2 +
      dimensions.系统性离谱 * 0.25 +
      dimensions.传播戏剧性 * 0.15 +
      dimensions.赛博浓度 * 0.15,
  );

  const comments = [
    "像段子，但很可能是真的。",
    "现实写起黑色幽默来，越来越熟练了。",
    "问题不只离谱，还离谱得很系统。",
    "这条新闻的抽象程度，值得单独立案。",
    "你以为它会收敛，结果它选择继续加码。",
  ];

  const reasons = [
    "它同时具备现实反转、传播戏剧性和制度味，所以看起来特别像一个失控产品现场。",
    "这类事件最荒谬的地方不只是奇怪，而是它真的可能在复杂流程里自洽发生。",
    "当技术、平台和人性缠在一起时，新闻就很容易长成一种赛博荒诞。",
    "它不像单点事故，更像一整套逻辑推演到最后自然结出的怪果。",
  ];

  if (categories.size === 0) {
    categories.add("魔幻现实");
  }

  return {
    score,
    categories: Array.from(categories).slice(0, 3),
    dimensions,
    comment: pick(comments, seed),
    reason: pick(reasons, seed >> 3),
  };
}

export function buildDailySummary(items: AbsurdityItem[]): Pick<DailyAbsurdity, "daily_index" | "level" | "summary" | "keywords" | "trend"> {
  const dailyIndex = Math.round(items.reduce((sum, item) => sum + item.score, 0) / Math.max(items.length, 1));
  const level = dailyIndex >= 70 ? "高危荒谬" : dailyIndex >= 40 ? "中度荒谬" : "轻微抽象";
  const keywords = Array.from(new Set(items.flatMap((item) => item.category))).slice(0, 4);
  const summary =
    dailyIndex >= 80
      ? "今天建议少刷热搜，多喝水，保护理智。"
      : dailyIndex >= 65
        ? "今天的世界略显抽象，建议保持一点旁观者心态。"
        : "今天整体还算平稳，但仍然有几条新闻在挑战常识。";

  const trend = Array.from({ length: 7 }, (_, index) => {
    const seed = items[index % items.length] ? hashString(items[index % items.length].title) : 77 + index * 3;
    return clamp(dailyIndex - 12 + (seed % 24), 45, 96);
  });

  return {
    daily_index: dailyIndex,
    level,
    summary,
    keywords,
    trend,
  };
}
