# AI Scoring

The project now supports optional AI-based absurdity scoring.

## How it works

When these environment variables are present:

- `AI_SCORING_BASE_URL`
- `AI_SCORING_API_KEY`
- `AI_SCORING_MODEL`

source items will be sent to an OpenAI-compatible `chat/completions` endpoint.

If any of them are missing, or the request fails, the app will automatically fall back to rule-based scoring.

## Expected compatibility

Any OpenAI-compatible endpoint should work, for example:
- OpenAI-compatible gateway
- model proxy
- self-hosted OpenAI-style service

## Required env vars

```bash
AI_SCORING_BASE_URL=https://your-openai-compatible-endpoint/v1
AI_SCORING_API_KEY=your_key
AI_SCORING_MODEL=your_model_name
```

## Output shape expected from model

The model is asked to return JSON like:

```json
{
  "absurdity_score": 78,
  "categories": ["AI", "魔幻现实"],
  "dimensions": {
    "反常识": 80,
    "黑色幽默": 72,
    "系统性离谱": 75,
    "传播戏剧性": 81,
    "赛博浓度": 70
  },
  "comment": "一句不超过28字的短吐槽",
  "reason": "1-2句解释为什么这条新闻荒谬"
}
```

## Fallback behavior

If AI scoring fails:
- source fetching continues
- scoring falls back to rule-based logic
- page rendering is unaffected
