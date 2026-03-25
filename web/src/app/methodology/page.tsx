import Link from "next/link";

export const metadata = {
  title: "指数说明 · 今日荒谬指数",
};

const dimensions = [
  {
    name: "反常识",
    desc: "一条事件有多违背直觉。分越高，说明你第一眼越容易怀疑自己是不是看错了。",
  },
  {
    name: "黑色幽默",
    desc: "一条新闻是否带有那种让人想笑、但笑完又有点发凉的气质。",
  },
  {
    name: "系统性离谱",
    desc: "离谱感是不是来自平台、流程、制度、组织机制，而不只是单个人的奇怪行为。",
  },
  {
    name: "传播戏剧性",
    desc: "这件事是不是天然适合传播，越扩散越像现实自己在加剧情强度。",
  },
  {
    name: "赛博浓度",
    desc: "技术、平台、互联网语境、AI、热搜、流量机制在事件里出现得有多强。",
  },
];

const modes = [
  {
    name: "rule",
    desc: "规则层兜底。根据标题里的关键词、类型和基础语义特征先给一个稳定分数。",
  },
  {
    name: "cache",
    desc: "命中历史 AI 缓存。说明这条内容或极相近内容之前已经被模型评分过，直接复用已有判断。",
  },
  {
    name: "ai",
    desc: "AI 增强评分。会对标题做更细的编辑化判断，并补充更自然的 comment / reason。",
  },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(114,255,191,0.08),transparent_28%),linear-gradient(180deg,#050b11,#09131b_36%,#060d14_100%)] text-white">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-emerald-300">Methodology</div>
            <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">荒谬指数是怎么算的？</h1>
            <p className="mt-3 max-w-3xl text-slate-400">
              这不是“绝对客观指数”，而是一套有明确方法的编辑化评分：用多源聚合、规则层、AI 增强和归档回看，把“现实到底离谱到几分”讲清楚。
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

        <section className="mb-8 rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">先说结论</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
            <p>
              <strong className="text-white">“今日荒谬指数”不是客观真理，</strong>
              它更像一个有方法的编辑判断系统：先把一天里最值得看的离谱事件聚到一起，再用统一维度去量化它们的抽象程度。
            </p>
            <p>
              所以这里的分数并不声称“百分之百客观”，但它也不是拍脑袋：它有稳定输入源、有规则兜底、有 AI 增强、有历史沉淀，也能解释为什么今天会高、为什么某条会排第一。
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">评分维度</h2>
          <p className="mt-2 text-slate-400">每条入榜事件都会按同一组维度理解。最后的总分不是单点印象，而是几种离谱感叠加后的结果。</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {dimensions.map((item) => (
              <div key={item.name} className="rounded-[20px] border border-white/8 bg-black/15 p-5">
                <div className="text-xl font-bold text-white">{item.name}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">分数是怎么来的</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
            <p>
              <strong className="text-white">第一步：</strong>
              从多个内容源抓取当天的热点与新闻线索。
            </p>
            <p>
              <strong className="text-white">第二步：</strong>
              对明显重复或高度相似的事件做聚合 / 去重，避免同一件事因为多家重复报道而虚高。
            </p>
            <p>
              <strong className="text-white">第三步：</strong>
              先走规则层，给每条标题一个基础分和初步分类。
            </p>
            <p>
              <strong className="text-white">第四步：</strong>
              如果 AI 可用，再由模型补充更细的编辑判断，包括 comment、reason 和维度修正。
            </p>
            <p>
              <strong className="text-white">第五步：</strong>
              取当天得分最高、最值得看的 10 条，汇总成当日指数、关键词和解释层。
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">AI / Cache / Rule 是什么关系？</h2>
          <p className="mt-2 text-slate-400">状态页里会看到三种评分来源，它们不是互相冲突，而是逐层增强。</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {modes.map((item) => (
              <div key={item.name} className="rounded-[20px] border border-white/8 bg-black/15 p-5">
                <div className="text-xl font-bold text-white">{item.name}</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">为什么它不是“绝对客观分”？</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
            <p>
              因为“荒谬”本身就不是一个像温度那样纯物理的量。它包含人的判断、时代语境、平台环境、传播机制，天然带一点立场和编辑感。
            </p>
            <p>
              这个项目做的不是假装完全客观，而是尽量做到：
              <strong className="text-white"> 有输入依据、有维度拆解、有解释逻辑、能被复盘。</strong>
            </p>
            <p>
              简单说：它不是“真理分数”，而是“方法明确、口径稳定、可持续优化的编辑化指数”。
            </p>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/8 bg-white/4 p-6">
          <h2 className="text-2xl font-bold tracking-[-0.03em]">接下来还会继续优化什么</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-slate-300">
            <p>后面最值得补的是两件事：一是更强的事件聚类，二是少量人工校准能力。这样指数会更稳，也会更像真正长期运行的内容产品。</p>
            <p>如果你已经看完这里，再去看首页的解释层和状态页，就能更容易理解这个项目现在到底跑到了哪一步。</p>
          </div>
        </section>
      </div>
    </main>
  );
}
