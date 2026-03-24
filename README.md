# 今日荒谬指数

一句话：今天的世界，离谱到几分？

本目录包含一个可直接预览和继续开发的 V1 方案：

- `prototype/index.html`：首页静态原型
- `data/today.json`：今日假数据
- `prompts/absurdity-scoring.md`：AI 打分与吐槽 Prompt
- `docs/prd.md`：简版 PRD

## 建议启动顺序

1. 先打开 `prototype/index.html` 看视觉和结构
2. 再看 `data/today.json`，确认数据字段是否顺手
3. 用 `prompts/absurdity-scoring.md` 跑 AI 生成结构化结果
4. 最后按 `docs/prd.md` 开始做真正的 Next.js / API 版本

## V1 核心模块

- 今日荒谬总指数
- TOP 5 荒谬新闻
- 维度评分可视化
- 7 日趋势
- AI 吐槽 / 原因说明

## 推荐后续技术栈

- Next.js
- Tailwind CSS
- shadcn/ui
- Recharts / ECharts
- 数据先用 JSON，后面再切数据库
