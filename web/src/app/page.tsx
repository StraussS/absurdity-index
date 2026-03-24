import { getTodayData } from "@/lib/sources";

const trendDays = ["一", "二", "三", "四", "五", "六", "今"];

async function ScoreCard({ item }: { item: Awaited<ReturnType<typeof getTodayData>>["top_items"][number] }) {
  return (
    <article className="grid gap-5 rounded-[24px] border border-white/8 bg-white/4 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur md:grid-cols-[1fr_160px]">
      <div>
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-emerald-100/85">
          <span className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1">{item.source}</span>
          {item.category.map((cat) => (
            <span key={cat} className="rounded-full border border-emerald-300/15 bg-emerald-300/8 px-3 py-1">
              {cat}
            </span>
          ))}
          <span className="rounded-full border border-white/8 bg-white/5 px-3 py-1 text-slate-300">{item.time}</span>
        </div>

        <h3 className="mb-3 text-xl leading-8 font-semibold text-white md:text-2xl">{item.title}</h3>
        <p className="mb-3 text-base leading-7 text-emerald-50">{item.comment}</p>
        <p className="text-sm leading-7 text-slate-300 md:text-[15px]">{item.reason}</p>
      </div>

      <div className="rounded-[18px] border border-white/8 bg-white/4 p-5 text-center">
        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-slate-400">荒谬分</div>
        <div className="text-5xl leading-none font-black text-amber-300">{item.score}</div>
        <div className="mt-3 text-sm text-slate-300">{item.score >= 70 ? "高危荒谬" : item.score >= 40 ? "中度荒谬" : "轻微抽象"}</div>
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block text-xs text-cyan-300 underline underline-offset-4"
        >
          查看原文
        </a>
      </div>
    </article>
  );
}

export default async function Home() {
  const today = await getTodayData();
  const lead = today.top_items[0];
  const dimensions = lead ? Object.entries(lead.dimensions) : [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(111,233,255,0.08),transparent_24%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10">
        <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 text-lg font-bold tracking-[0.01em]">
            <span className="h-3 w-3 rounded-full bg-[linear-gradient(135deg,#72ffbf,#6fe9ff)] shadow-[0_0_18px_rgba(114,255,191,0.8)]" />
            今日荒谬指数
          </div>
          <div className="text-sm text-slate-400">{today.date} · 世界异常监控台</div>
        </header>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-emerald-200/10 bg-[rgba(10,20,30,0.72)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="mb-3 text-xs uppercase tracking-[0.28em] text-emerald-300">Absurdity Monitor</div>
            <h1 className="mb-4 text-5xl leading-none font-black tracking-[-0.05em] md:text-7xl">
              今天的世界，<br />离谱到几分？
            </h1>
            <p className="mb-6 max-w-3xl text-lg leading-8 text-emerald-50/88 md:text-xl">
              我们抓取每天最像段子、最反常识、最有赛博荒诞感的事件，
              用一个不太严肃但相当认真的指数，把现实的抽象程度量化给你看。
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#top5" className="rounded-full border border-emerald-300/25 bg-emerald-300/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-300/12">
                查看今日 TOP 5
              </a>
              <a href="#trend" className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                查看历史趋势
              </a>
            </div>
          </div>

          <div className="rounded-[28px] border border-emerald-200/10 bg-[rgba(10,20,30,0.72)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur">
            <div className="text-xs uppercase tracking-[0.22em] text-slate-400">今日荒谬指数</div>
            <div className="mt-3 text-[108px] leading-none font-black text-emerald-300 drop-shadow-[0_0_24px_rgba(114,255,191,0.22)] md:text-[120px]">
              {today.daily_index}
            </div>
            <div className="inline-flex rounded-full border border-rose-300/20 bg-rose-300/10 px-4 py-2 text-sm font-bold text-rose-100">
              {today.level}
            </div>
            <p className="mt-5 text-[15px] leading-7 text-emerald-50/88">{today.summary}</p>
          </div>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/8 bg-white/4 p-6">
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">总指数</div>
            <div className="mb-2 text-4xl font-black">{today.daily_index} / 100</div>
            <div className="text-sm text-amber-300">实时聚合 · 多源评分</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/4 p-6">
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">最荒谬领域</div>
            <div className="mb-2 text-4xl font-black">{today.keywords.slice(0, 2).join(" / ") || "魔幻现实"}</div>
            <div className="text-sm leading-6 text-slate-300">当前数据来自 百度热搜、微博热搜（可选）、IT之家、36氪、澎湃、华尔街见闻、头条、少数派、腾讯新闻、Google News RSS、Hacker News。</div>
          </div>
          <div className="rounded-[22px] border border-white/8 bg-white/4 p-6">
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">今日关键词</div>
            <div className="flex flex-wrap gap-2">
              {today.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-sm text-emerald-50/90">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section id="top5" className="mb-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.03em]">今天最离谱的 5 件事</h2>
              <p className="mt-2 text-slate-400">当前为中文热搜 + 科技资讯聚合 + 规则打分，后面可继续换成 AI 精评分。</p>
            </div>
          </div>
          <div className="grid gap-4">
            {today.top_items.map((item) => (
              <ScoreCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">今日荒谬由什么构成？</h2>
              <p className="mt-2 text-slate-400">这里先展示榜首事件的维度分解，方便你快速校准评分逻辑。</p>
            </div>
            <div className="grid gap-4">
              {dimensions.map(([name, value]) => (
                <div key={name} className="grid grid-cols-[100px_1fr_42px] items-center gap-3 text-sm md:grid-cols-[120px_1fr_42px]">
                  <span className="text-emerald-50">{name}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#6fe9ff,#72ffbf,#ffb347)] shadow-[0_0_18px_rgba(114,255,191,0.24)]"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <strong className="text-right text-emerald-50">{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div id="trend" className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">过去 7 天，世界正常过吗？</h2>
              <p className="mt-2 text-slate-400">当前趋势为根据今日榜单生成的占位走势，后面接数据库后可变成真实历史。</p>
            </div>
            <div className="flex h-[240px] items-end gap-3 pt-3">
              {today.trend.map((value, index) => (
                <div key={`${trendDays[index]}-${value}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="text-sm font-bold text-emerald-50">{value}</div>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-2xl rounded-b-md border border-emerald-200/14 bg-[linear-gradient(180deg,rgba(111,233,255,0.9),rgba(114,255,191,0.22))] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                      style={{ height: `${value}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400">{trendDays[index]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="px-1 pt-10 pb-4 text-center text-sm leading-7 text-slate-400">
          当前已接入真实来源：百度热搜 + IT之家 + 36氪 + 澎湃 + 华尔街见闻 + 今日头条 + 少数派 + 腾讯新闻 + Google News RSS + Hacker News；微博热搜支持通过 WEIBO_COOKIE 选配接入。<br />
          下一步最值得做的是：接 AI 精评分、持久化历史数据、生成分享图。
        </footer>
      </div>
    </main>
  );
}
