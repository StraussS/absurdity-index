import Link from "next/link";
import { listHistorySnapshots } from "@/lib/history";

export const metadata = {
  title: "历史归档 · 今日荒谬指数",
};

export default async function HistoryPage() {
  const snapshots = await listHistorySnapshots();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">History Archive</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">荒谬指数历史归档</h1>
            <p className="mt-3 text-slate-400">把每天的离谱程度留下来，方便回看哪一天的世界最抽象。</p>
          </div>
          <Link href="/" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/8">
            返回首页
          </Link>
        </div>

        <div className="grid gap-4">
          {snapshots.length === 0 ? (
            <div className="rounded-[24px] border border-white/8 bg-white/4 p-6 text-slate-300">还没有历史快照，等系统再跑几天就有了。</div>
          ) : (
            snapshots.map((item) => (
              <Link
                key={item.date}
                href={`/history/${item.date}`}
                className="grid gap-4 rounded-[24px] border border-white/8 bg-white/4 p-6 transition hover:bg-white/[0.07] md:grid-cols-[160px_1fr_120px] md:items-center"
              >
                <div>
                  <div className="text-sm text-slate-400">日期</div>
                  <div className="mt-1 text-2xl font-bold">{item.date}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">摘要</div>
                  <div className="mt-1 text-base text-emerald-50">{item.summary}</div>
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
                  <div className="mt-2 text-sm text-slate-300">{item.level}</div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
