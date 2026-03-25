# 今日荒谬指数 · 项目状态

## 项目定位

“今日荒谬指数”不是普通资讯站，而是一个把多源热点事件聚合后，按“荒谬感”进行评分、解释和可视化展示的网站。

核心目标：

- 每天输出一个总荒谬指数
- 挑出当天最离谱的 10 条事件
- 给出相对克制、可解释的维度评分和短评
- 形成可回看的历史归档与分享图资产

---

## 当前已完成

### 1. Web 主站

目录：`projects/absurdity-index/web`

当前已有：

- 首页：今日总指数 / TOP 10 / 维度拆解 / 7 日趋势
- 历史列表页：`/history`
- 历史详情页：`/history/[date]`
- 今日数据 API：`/api/today`
- 项目状态 API：`/api/status`
- 项目状态页：`/status`

### 2. 数据链路

主流程位于：`web/src/lib/sources.ts`

流程：

1. 读取 source registry
2. 拉取启用的数据源
3. 聚合并去重
4. 进行规则 / AI 双轨评分
5. 生成今日摘要
6. 合并历史趋势
7. 生成分享图
8. 保存每日 snapshot

### 3. 历史与分享图

- 历史快照目录：`web/data/history/*.json`
- 分享图路径会记录在 snapshot 中的 `share_image`

### 4. 评分机制

相关文件：

- `web/src/lib/absurdity.ts`
- `web/src/lib/ai-scoring.ts`

当前为双轨：

- 规则打分作为稳定兜底
- AI 打分作为增强层
- AI 不可用时可退回规则层
- AI 结果会缓存

---

## 当前主要数据源

已接入的默认源包括：

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

可通过环境变量或远程配置调整启停和数量。

---

## 关键运行文件

- 首页：`web/src/app/page.tsx`
- 历史列表：`web/src/app/history/page.tsx`
- 历史详情：`web/src/app/history/[date]/page.tsx`
- 今日 API：`web/src/app/api/today/route.ts`
- 状态 API：`web/src/app/api/status/route.ts`
- 状态页：`web/src/app/status/page.tsx`
- 数据聚合：`web/src/lib/sources.ts`
- 历史存储：`web/src/lib/history.ts`
- 数据源注册：`web/src/lib/source-registry.ts`
- 状态汇总：`web/src/lib/project-status.ts`

---

## 当前短板

1. 文档和代码推进速度不完全同步，仍需持续更新
2. 多源聚合后的“事件聚类”还不够强，目前主要是去重
3. 荒谬分的可解释性还可以继续增强
4. 缺少更完整的后台观察视角，当前先补了基础 status 视图

---

## 下一步建议（高优先级）

### P1

- 强化状态页，补充各 source 的实时抓取统计
- 提升 API / 打分链路可观察性
- 整理配置体系，减少散落 env 心智负担

### P2

- 增强“为什么今天是这个分数”的解释层
- 继续优化历史归档体验
- 持续优化分享图样式与传播效果

### P3

- 做事件聚类，而不只是简单去重
- 做“方法论 / 指数说明”页面
- 增加轻量人工校准能力
