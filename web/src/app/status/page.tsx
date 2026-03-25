import Link from "next/link";
import { getProjectStatus } from "@/lib/project-status";

export const metadata = {
  title: "项目状态 · 今日荒谬指数",
};

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 p-6">
      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="text-4xl font-black text-white">{value}</div>
      {hint ? <div className="mt-2 text-sm text-slate-300">{hint}</div> : null}
    </div>
  );
}

export default async function StatusPage() {
  const status = await getProjectStatus();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">Project Status</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">今日荒谬指数 · 当前状态</h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              这里集中看项目有没有站起来：数据源有没有开、AI 有没有配、历史快照有没有在积累。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              返回首页
            </Link>
            <Link href="/history" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              查看历史归档
            </Link>
            <a href="/api/status" target="_blank" rel="noreferrer" className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100 hover:bg-cyan-300/15">
              打开状态 JSON
            </a>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="数据源总数" value={status.sources.total} hint={`已启用 ${status.sources.enabled} 个`} />
          <StatCard label="历史快照" value={status.history.snapshots} hint={status.history.latest_date ? `最新：${status.history.latest_date}` : "还没有历史快照"} />
          <StatCard label="AI 评分" value={status.ai.scoring_enabled ? "已启用" : "未启用"} hint={status.ai.scoring_enabled ? "已检测到评分配置" : "当前走规则层兜底"} />
          <StatCard label="状态文档" value={status.docs.status_doc_exists ? "已存在" : "缺失"} hint="项目总览文档是否已补齐" />
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="抓取总条数" value={status.pipeline.merged_count} hint="所有已启用 source 合并后的原始条目数" />
          <StatCard label="去重后条数" value={status.pipeline.deduped_count} hint={`最终入榜 ${status.pipeline.final_count} 条`} />
          <StatCard label="AI / Cache / Rule" value={`${status.pipeline.ai_count} / ${status.pipeline.cache_count} / ${status.pipeline.rule_count}`} hint="入榜事件的评分来源分布" />
          <StatCard label="失败 source" value={status.pipeline.failed_sources.length} hint={status.pipeline.failed_sources.length > 0 ? "本轮有 source 报错" : "本轮 source 全部成功"} />
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">数据源启用情况</h2>
              <p className="mt-2 text-slate-400">现在不只看开没开，还能看到这一轮每个 source 实际抓到了多少条、有没有报错。</p>
            </div>
            <div className="grid gap-3">
              {status.pipeline.source_runs.map((item) => (
                <div key={item.key} className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{item.label}</div>
                      <div className="mt-1 text-xs text-slate-400">
                        key: {item.key} · limit: {item.requested_limit}
                      </div>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.ok ? "border border-emerald-300/15 bg-emerald-300/10 text-emerald-100" : "border border-rose-300/15 bg-rose-300/10 text-rose-100"
                      }`}
                    >
                      {item.ok ? "成功" : "失败"}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-300">
                    <span>抓取条数</span>
                    <strong className="text-white">{item.fetched_count}</strong>
                  </div>
                  {item.error ? <div className="mt-2 text-xs leading-6 text-rose-200/90">{item.error}</div> : null}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">最近一次结果</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between"><span>最新日期</span><strong className="text-white">{status.history.latest_date ?? "--"}</strong></div>
                <div className="flex items-center justify-between"><span>最新指数</span><strong className="text-amber-300">{status.history.latest_index ?? "--"}</strong></div>
                <div className="flex items-center justify-between"><span>最新等级</span><strong className="text-white">{status.history.latest_level ?? "--"}</strong></div>
                <div className="flex items-center justify-between"><span>生成模式</span><strong className="text-white">{status.pipeline.mode}</strong></div>
              </div>
              {status.history.latest_share_image ? (
                <a href={status.history.latest_share_image} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-cyan-300 underline underline-offset-4">
                  查看最近一次分享图
                </a>
              ) : (
                <div className="mt-5 text-sm text-slate-400">最近一次还没有记录分享图路径。</div>
              )}
            </div>

            <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">运行配置概览</h2>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <div className="flex items-center justify-between"><span>远程源配置</span><strong className="text-white">{status.sources.remote_config ? "已配置" : "未配置"}</strong></div>
                <div className="flex items-center justify-between"><span>AI Base URL</span><strong className="text-white">{status.ai.base_url_configured ? "已配置" : "未配置"}</strong></div>
                <div className="flex items-center justify-between"><span>AI Model</span><strong className="text-white">{status.ai.model_configured ? "已配置" : "未配置"}</strong></div>
                <div className="flex items-center justify-between"><span>多源聚合事件</span><strong className="text-white">{status.pipeline.multi_source_count}</strong></div>
              </div>
              {status.sources.remote_config_url ? (
                <div className="mt-4 break-all rounded-2xl border border-white/8 bg-black/15 p-3 text-xs leading-6 text-slate-400">
                  remote config: {status.sources.remote_config_url}
                </div>
              ) : null}
              {status.pipeline.failed_sources.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-300/8 p-3 text-xs leading-6 text-rose-100">
                  失败 source：{status.pipeline.failed_sources.map((item: { label: string }) => item.label).join("、")}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/8 p-3 text-xs leading-6 text-emerald-100">
                  这轮所有已启用 source 都成功返回了结果。
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
