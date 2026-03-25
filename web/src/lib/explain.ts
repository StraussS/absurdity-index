import { AbsurdityDimensions, DailyAbsurdity } from "@/lib/absurdity";

const dimensionOrder: Array<keyof AbsurdityDimensions> = ["反常识", "黑色幽默", "系统性离谱", "传播戏剧性", "赛博浓度"];

const dimensionDescriptions: Record<keyof AbsurdityDimensions, string> = {
  反常识: "说明今天很多事件本身就违背直觉，第一眼看上去像假新闻。",
  黑色幽默: "说明新闻里带着一种很难认真面对、又很难不苦笑的气质。",
  系统性离谱: "说明离谱的不只是个体行为，而是流程、平台或机制一起在添油加醋。",
  传播戏剧性: "说明事件天然带有话题性，越传播越像现实在自我加码。",
  赛博浓度: "说明技术、平台、网络语境在这批事件里存在感很强。",
};

function averageDimensions(items: DailyAbsurdity["top_items"]) {
  const initial = Object.fromEntries(dimensionOrder.map((key) => [key, 0])) as Record<keyof AbsurdityDimensions, number>;
  if (items.length === 0) return initial;

  for (const item of items) {
    for (const key of dimensionOrder) {
      initial[key] += item.dimensions[key] ?? 0;
    }
  }

  for (const key of dimensionOrder) {
    initial[key] = Math.round(initial[key] / items.length);
  }

  return initial;
}

function rankDimensions(dimensions: Record<keyof AbsurdityDimensions, number>) {
  return [...dimensionOrder]
    .map((key) => ({ key, value: dimensions[key] }))
    .sort((a, b) => b.value - a.value);
}

export function explainDailyScore(data: DailyAbsurdity) {
  const averages = averageDimensions(data.top_items);
  const ranked = rankDimensions(averages);
  const primary = ranked[0];
  const secondary = ranked[1];

  const categories = new Map<string, number>();
  for (const item of data.top_items) {
    for (const cat of item.category) {
      categories.set(cat, (categories.get(cat) ?? 0) + 1);
    }
  }

  const dominantCategories = [...categories.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, count]) => ({ name, count }));

  const why = primary && secondary
    ? `今天的总指数主要被「${primary.key}」和「${secondary.key}」拉高，说明这批事件既反直觉，又自带很强的话题扩散性。`
    : "今天的总指数主要来自多条高分事件叠加，不是单一一条新闻把整体拉上去。";

  return {
    averages,
    ranked,
    primary,
    secondary,
    dominantCategories,
    why,
    descriptions: dimensionDescriptions,
  };
}

export function explainTopItem(data: DailyAbsurdity) {
  const lead = data.top_items[0];
  if (!lead) return null;

  const ranked = rankDimensions(lead.dimensions);
  const primary = ranked[0];
  const secondary = ranked[1];
  const third = ranked[2];

  return {
    lead,
    ranked,
    primary,
    secondary,
    third,
    summary: primary && secondary
      ? `它排第一，主要因为「${primary.key}」和「${secondary.key}」都很高：事件本身已经够反常，再加上传播性强，很容易把整天的荒谬气氛直接拉满。`
      : "它排第一，是因为整体分数明显高于其他事件。",
  };
}
