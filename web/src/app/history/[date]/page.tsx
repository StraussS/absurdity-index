import Link from "next/link";
import { notFound } from "next/navigation";
import { explainDailyScore, explainTopItem } from "@/lib/explain";
import { loadDailySnapshot, listHistorySnapshots } from "@/lib/history";

export async function generateStaticParams() {
  const snapshots = await listHistorySnapshots();
  return snapshots.map((item) => ({ date: item.date }));
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[18px] border border-white/8 bg-white/4 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default async function HistoryDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const [snapshot, snapshots] = await Promise.all([loadDailySnapshot(date), listHistorySnapshots()]);

  if (!snapshot) {
    notFound();
  }

  const currentIndex = snapshots.findIndex((item) => item.date === snapshot.date);
  const newer = currentIndex > 0 ? snapshots[currentIndex - 1] : null;
  const older = currentIndex >= 0 && currentIndex < snapshots.length - 1 ? snapshots[currentIndex + 1] : null;
  const lead = snapshot.top_items[0] ?? null;
  const explanation = explainDailyScore(snapshot as any);
  const leadExplanation = explainTopItem(snapshot as any);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">Daily Snapshot</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">{snapshot.date}</h1>
            <p className="mt-3 max-w-3xl text-slate-400">{snapshot.summary}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">当日指数</div>
            <div className="mt-1 text-5xl font-black text-amber-300">{snapshot.daily_index}</div>
            <div className="mt-2 text-sm text-slate-300">{snapshot.level}</div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {snapshot.keywords.map((keyword) => (
            <span key={keyword} className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-slate-200">
              {keyword}
            </span>
          ))}
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/history" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
            返回历史列表
          </Link>
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
            返回首页
          </Link>
          {newer ? (
            <Link href={`/history/${newer.date}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              查看较新一天
            </Link>
          ) : null}
          {older ? (
            <Link href={`/history/${older.date}`} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
              查看较早一天
            </Link>
          ) : null}
          {snapshot.share_image ? (
            <a href={snapshot.share_image} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-300/15">
              查看分享图
            </a>
          ) : null}
        </div>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">当天概览</h2>
              <p className="mt-2 text-slate-400">先看这一天的整体质感：关键词、榜首事件、是否有分享图，能快速判断当天内容形态。</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <StatChip label="入榜事件" value={snapshot.top_items.length} />
              <StatChip label="榜首来源" value={lead?.source ?? "--"} />
              <StatChip label="榜首得分" value={lead?.score ?? "--"} />
            </div>
            {lead ? (
              <div className="mt-5 rounded-[22px] border border-white/8 bg-black/15 p-5">
                <div className="mb-2 text-xs uppercase tracking-[0.18em] text-slate-400">当天最离谱</div>
                <h2 className="text-2xl font-bold leading-9 text-white">{lead.title}</h2>
                <p className="mt-3 text-base leading-7 text-emerald-50">{lead.comment}</p>
                <p className="mt-3 text-sm leading-7 text-slate-300">{lead.reason}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">为什么这天分数高？</h2>
              <p className="mt-2 text-slate-400">不是单看总分，而是看这一天到底是哪几种离谱感在共同抬升指数。</p>
            </div>
            <div className="grid gap-3">
              {explanation.ranked.map((item) => (
                <div key={item.key} className="grid grid-cols-[110px_1fr_42px] items-center gap-3 text-sm">
                  <span className="text-emerald-50">{item.key}</span>
                  <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#6fe9ff,#72ffbf,#ffb347)]" style={{ width: `${item.value}%` }} />
                  </div>
                  <strong className="text-right text-emerald-50">{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-[20px] border border-white/8 bg-black/15 p-4 text-sm leading-7 text-slate-300">
              {explanation.why}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">为什么榜首排第一？</h2>
              <p className="mt-2 text-slate-400">历史页里也把榜首解释留下来，后面回看时不会只剩一个分数。</p>
            </div>
            {leadExplanation ? (
              <>
                <div className="rounded-[20px] border border-white/8 bg-black/15 p-4 text-sm leading-7 text-slate-300">
                  {leadExplanation.summary}
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {leadExplanation.ranked.slice(0, 3).map((item, index) => (
                    <div key={item.key} className="rounded-[18px] border border-white/8 bg-white/4 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">TOP {index + 1}</div>
                      <div className="mt-2 text-lg font-bold text-white">{item.key}</div>
                      <div className="mt-1 text-3xl font-black text-amber-300">{item.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">暂时没有榜首解释数据。</div>
            )}
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">分享资产</h2>
              <p className="mt-2 text-slate-400">历史页顺手把当天的对外成品也挂住，避免只有数据没有传播资产。</p>
            </div>
            {snapshot.share_image ? (
              <div className="overflow-hidden rounded-[22px] border border-white/8 bg-black/20">
                <img src={snapshot.share_image} alt={`${snapshot.date} 分享图`} className="w-full object-cover" />
              </div>
            ) : (
              <div className="rounded-[22px] border border-white/8 bg-black/15 p-5 text-sm leading-7 text-slate-400">
                这一天还没有记录分享图路径，后面如果补生成，这里就能直接回看当日成品。
              </div>
            )}
          </div>
        </section>

        <section className="grid gap-4">
          {snapshot.top_items.map((item) => {
            const dimensions = Object.entries(item.dimensions ?? {});
            return (
              <article key={item.id} className="grid gap-5 rounded-[24px] border border-white/8 bg-white/4 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur lg:grid-cols-[1fr_200px]">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs text-emerald-100/85">
                    <span className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1">{item.source}</span>
                    {item.source_count && item.source_count > 1 ? (
                      <span className="rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 text-cyan-100">
                        同事件聚类 · {item.source_count} 个来源
                      </span>
                    ) : null}
                    {item.category.map((cat) => (
                      <span key={cat} className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1">
                        {cat}
                      </span>
                    ))}
                    <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-slate-300">{item.time}</span>
                  </div>
                  <h2 className="mb-3 text-xl leading-8 font-semibold text-white md:text-2xl">{item.title}</h2>
                  <p className="mb-3 text-base leading-7 text-emerald-50">{item.comment}</p>
                  <p className="text-sm leading-7 text-slate-300 md:text-[15px]">{item.reason}</p>
                  {item.sources && item.sources.length > 1 ? (
                    <div className="mt-4 text-xs leading-6 text-slate-400">聚合来源：{item.sources.join(" · ")}</div>
                  ) : null}

                  {dimensions.length > 0 ? (
                    <div className="mt-5 grid gap-3">
                      {dimensions.map(([name, value]) => (
                        <div key={name} className="grid grid-cols-[110px_1fr_42px] items-center gap-3 text-sm">
                          <span className="text-emerald-50">{name}</span>
                          <div className="h-2.5 overflow-hidden rounded-full bg-white/8">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,#6fe9ff,#72ffbf,#ffb347)]"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <strong className="text-right text-emerald-50">{value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[18px] border border-white/8 bg-white/4 p-5 text-center">
                  <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">荒谬分</div>
                  <div className="text-5xl leading-none font-black text-amber-300">{item.score}</div>
                  <div className="mt-3 text-sm text-slate-300">
                    {item.score >= 70 ? "高危荒谬" : item.score >= 40 ? "中度荒谬" : "轻微抽象"}
                  </div>
                  <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs text-cyan-300 underline underline-offset-4">
                    查看原文
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}
