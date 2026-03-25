import Link from "next/link";
import { listHistorySnapshots } from "@/lib/history";

export const metadata = {
  title: "历史归档 · 今日荒谬指数",
};

function SummaryCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-white/4 p-6">
      <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">{label}</div>
      <div className="text-4xl font-black text-white">{value}</div>
      {hint ? <div className="mt-2 text-sm text-slate-300">{hint}</div> : null}
    </div>
  );
}

export default async function HistoryPage() {
  const snapshots = await listHistorySnapshots();
  const latest = snapshots[0] ?? null;
  const peak = snapshots.reduce<(typeof snapshots)[number] | null>((acc, item) => {
    if (!acc || item.daily_index > acc.daily_index) return item;
    return acc;
  }, null);
  const average = snapshots.length > 0 ? Math.round(snapshots.reduce((sum, item) => sum + item.daily_index, 0) / snapshots.length) : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">History Archive</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">荒谬指数历史归档</h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              把每天的离谱程度留下来，方便回看哪一天的世界最抽象，也方便看这个项目到底积累了多少真实历史结果。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              返回首页
            </Link>
            <Link href="/status" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              查看项目状态
            </Link>
          </div>
        </div>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <SummaryCard label="历史快照数" value={snapshots.length} hint={snapshots.length > 0 ? "已经开始形成可回看的档案" : "还在等待第一批沉淀"} />
          <SummaryCard label="最近一次指数" value={latest?.daily_index ?? "--"} hint={latest ? `${latest.date} · ${latest.level}` : "还没有最新结果"} />
          <SummaryCard label="历史平均指数" value={average ?? "--"} hint={peak ? `最高出现在 ${peak.date} · ${peak.daily_index}` : "等历史更多一点再看波动"} />
        </section>

        <div className="grid gap-4">
          {snapshots.length === 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-6 text-slate-300">还没有历史快照，等系统再跑几天就有了。</div>
          ) : (
            snapshots.map((item) => {
              const lead = item.top_items[0];
              return (
                <Link
                  key={item.date}
                  href={`/history/${item.date}`}
                  className="grid gap-5 rounded-[24px] border border-white/8 bg-white/4 p-6 transition hover:bg-white/[0.07] md:grid-cols-[160px_1fr_150px] md:items-center"
                >
                  <div>
                    <div className="text-sm text-slate-400">日期</div>
                    <div className="mt-1 text-2xl font-bold">{item.date}</div>
                    <div className="mt-3 text-sm text-slate-300">{item.level}</div>
                  </div>

                  <div>
                    <div className="text-sm text-slate-400">当日摘要</div>
                    <div className="mt-1 text-base leading-7 text-emerald-50">{item.summary}</div>
                    {lead ? (
                      <div className="mt-4 rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm leading-6 text-slate-300">
                        <div className="mb-1 text-xs uppercase tracking-[0.18em] text-slate-400">榜首事件</div>
                        <div className="font-semibold text-white">{lead.title}</div>
                        <div className="mt-1 text-slate-400">{lead.source} · {lead.score} 分</div>
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.keywords.map((keyword) => (
                        <span key={keyword} className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-200">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-400">指数</div>
                    <div className="mt-1 text-4xl font-black text-amber-300">{item.daily_index}</div>
                    <div className="mt-2 text-sm text-slate-300">共 {item.top_items.length} 条入榜事件</div>
                    {item.share_image ? (
                      <div className="mt-4 text-xs text-cyan-300">含分享图</div>
                    ) : (
                      <div className="mt-4 text-xs text-slate-500">暂无分享图</div>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
