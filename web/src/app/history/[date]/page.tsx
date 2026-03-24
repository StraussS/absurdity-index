import Link from "next/link";
import { notFound } from "next/navigation";
import { loadDailySnapshot, listHistorySnapshots } from "@/lib/history";

export async function generateStaticParams() {
  const snapshots = await listHistorySnapshots();
  return snapshots.map((item) => ({ date: item.date }));
}

export default async function HistoryDetailPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const snapshot = await loadDailySnapshot(date);

  if (!snapshot) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-6">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">Daily Snapshot</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">{snapshot.date}</h1>
            <p className="mt-3 text-slate-400">{snapshot.summary}</p>
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
          {snapshot.share_image ? (
            <a href={snapshot.share_image} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-300/15">
              查看分享图
            </a>
          ) : null}
        </div>

        <section className="grid gap-4">
          {snapshot.top_items.map((item) => (
            <article key={item.id} className="grid gap-5 rounded-[24px] border border-white/8 bg-white/4 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur md:grid-cols-[1fr_160px]">
              <div>
                <div className="mb-3 flex flex-wrap gap-2 text-xs text-emerald-100/85">
                  <span className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1">{item.source}</span>
                  {item.source_count && item.source_count > 1 ? (
                    <span className="rounded-full border border-cyan-300/15 bg-cyan-300/8 px-3 py-1 text-cyan-100">
                      多方来源 · {item.source_count} 条线索
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
                  <div className="mt-4 text-xs leading-6 text-slate-400">
                    聚合来源：{item.sources.join(" · ")}
                  </div>
                ) : null}
              </div>
              <div className="rounded-[18px] border border-white/8 bg-white/4 p-5 text-center">
                <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">荒谬分</div>
                <div className="text-5xl leading-none font-black text-amber-300">{item.score}</div>
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs text-cyan-300 underline underline-offset-4">
                  查看原文
                </a>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
