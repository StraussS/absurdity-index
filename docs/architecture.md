# Architecture

## Overview

`absurdity-index` 目前是一个以 Next.js 为展示层、以本地文件为缓存与历史存储的轻量内容产品原型。

核心思路不是“做一个普通资讯站”，而是把多源热点事件加工成一个可持续输出的指数型内容页面。

## High-level flow

```text
Sources
  ├─ Weibo / Baidu / IT之家 / 36氪 / 澎湃 / 腾讯 / RSS / Hacker News ...
  ↓
Fetchers
  ↓
Normalization
  ↓
Dedupe / clustering
  ↓
Rule scoring
  ↓
AI enhancement (optional)
  ↓
Daily summary + ranking + explanations
  ↓
History snapshot + share card
  ↓
Next.js pages / API routes
```

## Main modules

### 1. Source fetchers

主要位于：`web/src/lib/sources/*.ts`

职责：
- 从不同站点抓取内容
- 转成统一事件结构
- 为后续去重和评分提供标准化输入

统一入口：
- `web/src/lib/source-registry.ts`
- `web/src/lib/sources.ts`

### 2. Scoring

主要位于：
- `web/src/lib/absurdity.ts`
- `web/src/lib/ai-scoring.ts`
- `web/src/lib/explain.ts`

职责：
- 规则层生成基础分
- AI 层补充 comment / reason / 维度修正
- 给首页和方法页提供可解释结果

### 3. Dedupe / clustering

主要位于：
- `web/src/lib/dedupe.ts`

职责：
- 减少同一事件被多个来源重复计入
- 对多来源事件进行聚合展示

### 4. Persistence

主要位于：
- `web/src/lib/history.ts`
- `web/src/lib/snapshot.ts`
- `web/src/lib/ai-cache.ts`

职责：
- 保存历史快照
- 保存 AI 评分缓存
- 为趋势和归档页面提供数据基础

### 5. Presentation

主要位于：
- `web/src/app/page.tsx`
- `web/src/app/history/page.tsx`
- `web/src/app/history/[date]/page.tsx`
- `web/src/app/status/page.tsx`
- `web/src/app/methodology/page.tsx`

职责：
- 渲染首页、归档、状态页、方法页
- 暴露今日数据和状态数据 API

## Runtime configuration

当前通过环境变量进行运行期控制：

- `ABSURDITY_SOURCE_CONFIG_URL`
- `ABSURDITY_ENABLED_SOURCES`
- `ABSURDITY_DISABLED_SOURCES`
- `ABSURDITY_SOURCE_LIMITS`
- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `OPENAI_MODEL`

## Storage strategy

当前是“轻量文件化存储”，优点是部署简单、方便快速验证：

- 历史快照：`web/data/history/*.json`
- AI 缓存：`web/data/ai-cache/*.json`
- 翻译缓存：`web/data/translation-cache/*.json`

后续如果做长期化产品，可以迁移到 SQLite / Postgres。

## Known gaps

- 聚类能力仍偏轻，更多是去重而不是强语义聚合
- 状态页还偏工程视角，后台观察能力不足
- 运行依赖部分仍散落在 env 中，配置入口还可继续收敛
- 文件存储方式简单，但在规模放大后不够优雅
