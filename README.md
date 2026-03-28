# absurdity-index

> 今天的世界，离谱到几分？

`absurdity-index` 是一个把多源热点事件聚合后，按“荒谬感”进行评分、解释和可视化展示的网站原型。它不是传统新闻站，而是一个带编辑判断和方法论说明的内容产品：每天抓取热点、去重聚类、规则评分、AI 增强，再输出当日指数、TOP 事件、历史归档和分享图。

## What it does

- 聚合多源热点与新闻线索
- 对重复事件做去重 / 聚类
- 通过规则层 + AI 增强生成荒谬分
- 输出每日总指数、关键词、解释层和 TOP 10 榜单
- 生成历史快照与分享图
- 提供状态页和方法论页面，方便观察当前运行情况

## Current structure

```text
absurdity-index/
├─ data/                     # 早期原型数据
├─ docs/
│  ├─ architecture.md        # 架构说明
│  ├─ deployment.md          # 部署说明
│  └─ prd.md                 # 简版 PRD
├─ prompts/                  # AI 打分提示词
├─ prototype/                # 静态原型
├─ STATUS.md                 # 当前项目状态
└─ web/                      # Next.js 主站
   ├─ src/app                # 页面与 API
   ├─ src/lib                # 数据源、评分、归档、分享图逻辑
   ├─ data/history           # 已归档的历史快照样例
   └─ .env.example           # 环境变量示例
```

## Main features

### 首页
- 今日荒谬指数
- TOP 10 荒谬事件
- 维度解释层
- 关键词与趋势视图

### 历史归档
- 历史列表页 `/history`
- 历史详情页 `/history/[date]`

### 可观察性
- 状态 API：`/api/status`
- 今日数据 API：`/api/today`
- 状态页：`/status`
- 方法页：`/methodology`

## Data pipeline

1. 从多个内容源抓取热点与新闻
2. 聚合、去重、合并相似事件
3. 用规则层生成基础分
4. 在可用时调用 AI 进行增强评分
5. 产出当天榜单、总结、维度解释
6. 保存历史快照并生成分享图

更详细说明见：[`docs/architecture.md`](./docs/architecture.md)

## Supported sources

默认已接入：

- 微博热搜
- 百度热搜
- IT之家
- 36氪
- 澎湃新闻
- 华尔街见闻
- 今日头条
- 少数派
- 腾讯新闻
- Google News RSS
- Hacker News

## Local development

### Requirements

- Node.js 20+
- npm

### Install

```bash
cd web
npm install
```

### Start dev server

```bash
cd web
npm run dev
```

默认访问：<http://localhost:3000>

### Build for production

```bash
cd web
npm run build
npm run start
```

## Environment variables

复制一份环境变量模板：

```bash
cd web
cp .env.example .env.local
```

已支持的主要配置：

- `OPENAI_API_KEY`：启用 AI 增强评分
- `OPENAI_BASE_URL`：自定义 OpenAI 兼容接口
- `OPENAI_MODEL`：指定评分模型
- `ABSURDITY_SOURCE_CONFIG_URL`：远程 source 配置地址
- `ABSURDITY_ENABLED_SOURCES`：手动启用的数据源列表
- `ABSURDITY_DISABLED_SOURCES`：手动禁用的数据源列表
- `ABSURDITY_SOURCE_LIMITS`：各 source 的抓取数量 JSON

## Deployment

项目当前适合以 `Next.js + PM2 + Nginx` 的方式部署。

快速参考：

```bash
cd web
npm install
npm run build
pm2 start npm --name absurdity-index -- start
```

更完整的部署说明见：[`docs/deployment.md`](./docs/deployment.md)

## Notes on repository hygiene

为方便公开到 GitHub，本仓库默认忽略以下本地生成内容：

- `web/.env.local`
- `web/data/ai-cache/`
- `web/data/translation-cache/`
- `web/.next/`
- `web/node_modules/`

这样可以避免把本地密钥、缓存和构建产物一起提交上去。

## Roadmap

- 更强的事件聚类，而不只是去重
- 更稳定的状态页和 source 观测面板
- 更完整的解释层和评分校准能力
- 更成熟的分享图和传播资产生成链路

## License

当前未指定开源许可证。如需公开开源，建议补充 MIT 或 Apache-2.0。
