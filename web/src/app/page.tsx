import Link from "next/link";
import { explainDailyScore, explainTopItem } from "@/lib/explain";
import { getTodayData } from "@/lib/sources";

const trendDays = ["一", "二", "三", "四", "五", "六", "今"];

async function ScoreCard({ item }: { item: Awaited<ReturnType<typeof getTodayData>>["top_items"][number] }) {
  return (
    <article className="grid gap-5 rounded-[24px] border border-white/8 bg-white/4 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur md:grid-cols-[1fr_160px]">
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

        <h3 className="mb-3 text-xl leading-8 font-semibold text-white md:text-2xl">{item.title}</h3>
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
  const explanation = explainDailyScore(today);
  const leadExplanation = explainTopItem(today);

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
              抓取每天最像段子、最反常识、最有赛博荒诞感的事件，
              用一个不太严肃但相当认真的指数，量化现实的抽象程度。
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#top10" className="rounded-full border border-emerald-300/25 bg-emerald-300/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-300/12">
                查看今日 TOP 10
              </a>
              <a href="#trend" className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                查看历史趋势
              </a>
              <Link href="/history" className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                查看历史归档
              </Link>
              <Link href="/status" className="rounded-full border border-white/10 bg-white/4 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/8">
                查看项目状态
              </Link>
              <a href={`/share/${today.date}.svg`} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/15">
                查看今日分享图
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
            <div className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">主要拉分维度</div>
            <div className="mb-2 text-3xl font-black md:text-4xl">
              {explanation.primary?.key ?? "反常识"}
              {explanation.secondary ? ` / ${explanation.secondary.key}` : ""}
            </div>
            <div className="text-sm leading-6 text-slate-300">{explanation.why}</div>
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

        <section className="mb-8 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">为什么今天是这个分数？</h2>
              <p className="mt-2 text-slate-400">把今天入榜事件的维度平均后，先看看到底是哪几种“离谱感”把总指数顶上去了。</p>
            </div>
            <div className="grid gap-3">
              {explanation.ranked.map((item) => (
                <div key={item.key} className="grid grid-cols-[110px_1fr_42px] items-center gap-3 text-sm md:grid-cols-[130px_1fr_42px]">
                  <span className="text-emerald-50">{item.key}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-white/8">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#6fe9ff,#72ffbf,#ffb347)]" style={{ width: `${item.value}%` }} />
                  </div>
                  <strong className="text-right text-emerald-50">{item.value}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[20px] border border-white/8 bg-black/15 p-4 text-sm leading-7 text-slate-300">
              {explanation.primary ? (
                <>
                  <div className="font-semibold text-white">主导维度：{explanation.primary.key}</div>
                  <div className="mt-2">{explanation.descriptions[explanation.primary.key]}</div>
                  {explanation.secondary ? <div className="mt-3">第二拉分项是「{explanation.secondary.key}」，说明这批事件不只是怪，还特别容易扩散成公共话题。</div> : null}
                </>
              ) : (
                <div>今天的数据还不够多，暂时无法生成解释。</div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/4 p-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">为什么榜首排第一？</h2>
              <p className="mt-2 text-slate-400">不是单纯因为它分高，而是它在最关键的几项离谱维度上同时冲了出来。</p>
            </div>
            {leadExplanation ? (
              <>
                <div className="rounded-[20px] border border-white/8 bg-black/15 p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-400">今日榜首</div>
                  <h3 className="mt-2 text-xl leading-8 font-semibold text-white">{leadExplanation.lead.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{leadExplanation.summary}</p>
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
                <div className="mt-4 text-sm leading-7 text-slate-300">
                  这条事件的高分不是单点偏高，而是多个维度同时在线，所以它会比普通热搜更像“当天气氛代表”。
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-400">暂时还没有榜首事件解释。</div>
            )}
          </div>
        </section>

        <section id="top10" className="mb-10">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-[-0.03em]">今天最离谱的 10 件事</h2>
              <p className="mt-2 text-slate-400">把今天最值得看的几件离谱事收拢在一起，省得你被满屏信息拖着跑。</p>
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
              <p className="mt-2 text-slate-400">这里展示最近 7 天已经保存下来的真实历史指数，用来看看世界到底有没有正常过。</p>
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
          有时候现实比虚构更会写黑色幽默。<br />
          如果今天已经够抽象了，至少这里会帮你把它整理清楚。
        </footer>
      </div>
    </main>
  );
}
