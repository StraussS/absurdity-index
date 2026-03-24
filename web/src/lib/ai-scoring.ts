import { AbsurdityDimensions, AbsurdityItem, scoreTitle } from "@/lib/absurdity";
import { loadAICache, saveAICache } from "@/lib/ai-cache";
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
    "你是‘今日荒谬指数’的中文编辑，不是营销号，也不是段子手。",
    "你的任务：根据新闻标题和来源，输出一份克制但有判断力的荒谬评分。",
    "风格要求：像清醒的编辑部在写尖锐短评，短、准、冷静，带一点黑色幽默，但不要油腻，不要硬玩梗。",
    "禁止事项：不要编造新闻事实；不要空泛大词；不要像公关稿；不要写成情绪化骂街。",
    "comment 要求：一句短吐槽，不超过 24 个汉字，最好有记忆点。",
    "reason 要求：1-2 句，解释为什么荒谬，必须紧扣标题本身。",
    "分类尽量具体，不要总是重复同一组词。",
    "输出必须是 JSON，不要 markdown，不要代码块。",
    "JSON 结构：",
    '{"absurdity_score": 0-100, "categories": ["分类1","分类2"], "dimensions": {"反常识":0-100,"黑色幽默":0-100,"系统性离谱":0-100,"传播戏剧性":0-100,"赛博浓度":0-100}, "comment": "不超过24字短吐槽", "reason": "1-2句原因说明"}',
  ].join("\n");
}

async function requestAIScoring(seed: SourceSeedItem): Promise<AIScoredItem | null> {
  const baseUrl = process.env.AI_SCORING_BASE_URL;
  const apiKey = process.env.AI_SCORING_API_KEY;
  const model = process.env.AI_SCORING_MODEL;

  if (!baseUrl || !apiKey || !model) {
    return null;
  }

  const cached = await loadAICache(seed);
  if (cached) {
    return {
      absurdity_score: cached.absurdity_score,
      categories: cached.categories,
      dimensions: cached.dimensions as Partial<AbsurdityDimensions> | undefined,
      comment: cached.comment,
      reason: cached.reason,
    };
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
      temperature: 0.35,
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
    const parsed = JSON.parse(raw) as AIScoredItem;
    if (typeof parsed.absurdity_score === "number") {
      await saveAICache(seed, {
        absurdity_score: clamp(Math.round(parsed.absurdity_score)),
        categories: parsed.categories,
        dimensions: parsed.dimensions as Record<string, number> | undefined,
        comment: parsed.comment,
        reason: parsed.reason,
      });
    }
    return parsed;
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
