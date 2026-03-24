import { AbsurdityDimensions, AbsurdityItem, scoreTitle } from "@/lib/absurdity";
import { SourceSeedItem, formatTime } from "@/lib/source-utils";

type AIScoredItem = {
  absurdity_score: number;
  categories?: string[];
  dimensions?: Partial<AbsurdityDimensions>;
  comment?: string;
  reason?: string;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function mergeDimensions(base: AbsurdityDimensions, patch?: Partial<AbsurdityDimensions>): AbsurdityDimensions {
  return {
    反常识: clamp(patch?.反常识 ?? base.反常识),
    黑色幽默: clamp(patch?.黑色幽默 ?? base.黑色幽默),
    系统性离谱: clamp(patch?.系统性离谱 ?? base.系统性离谱),
    传播戏剧性: clamp(patch?.传播戏剧性 ?? base.传播戏剧性),
    赛博浓度: clamp(patch?.赛博浓度 ?? base.赛博浓度),
  };
}

function systemPrompt() {
  return [
    "你是‘今日荒谬指数’网站的中文编辑与评分器。",
    "你的任务：根据一条新闻标题和来源，输出更像编辑部写的荒谬评分结果。",
    "要求：半认真、半讽刺；短、准、克制；不要油腻；不要编造新闻事实；仅基于输入标题与来源判断。",
    "输出必须是 JSON，不要 markdown，不要代码块。",
    "JSON 结构：",
    '{"absurdity_score": 0-100, "categories": ["分类1","分类2"], "dimensions": {"反常识":0-100,"黑色幽默":0-100,"系统性离谱":0-100,"传播戏剧性":0-100,"赛博浓度":0-100}, "comment": "不超过28字短吐槽", "reason": "1-2句原因说明"}',
  ].join("\n");
}

async function requestAIScoring(seed: SourceSeedItem): Promise<AIScoredItem | null> {
  const baseUrl = process.env.AI_SCORING_BASE_URL;
  const apiKey = process.env.AI_SCORING_API_KEY;
  const model = process.env.AI_SCORING_MODEL;

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: JSON.stringify({ title: seed.title, source: seed.source, pubDate: seed.pubDate ?? null }),
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI scoring failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AIScoredItem;
  } catch {
    return null;
  }
}

export async function scoreSeedItem(seed: SourceSeedItem, prefix: string, index: number): Promise<AbsurdityItem> {
  const fallback = scoreTitle(seed.title);
  let ai: AIScoredItem | null = null;

  try {
    ai = await requestAIScoring(seed);
  } catch {
    ai = null;
  }

  return {
    id: `${prefix}-${index}-${Buffer.from(seed.title).toString("base64").slice(0, 8)}`,
    title: seed.title,
    source: seed.source,
    time: formatTime(seed.pubDate),
    category: (ai?.categories && ai.categories.length > 0 ? ai.categories : fallback.categories).slice(0, 4),
    score: clamp(Math.round(ai?.absurdity_score ?? fallback.score)),
    comment: ai?.comment?.trim() || fallback.comment,
    reason: ai?.reason?.trim() || fallback.reason,
    dimensions: mergeDimensions(fallback.dimensions, ai?.dimensions),
    url: seed.link,
  } satisfies AbsurdityItem;
}

export async function scoreSeedItems(items: SourceSeedItem[], prefix: string): Promise<AbsurdityItem[]> {
  return Promise.all(items.map((item, index) => scoreSeedItem(item, prefix, index)));
}
