'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useEffect, useMemo, useRef, useState } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import QSentiaLogo from '@/components/QSentiaLogo';
import { fmtNum, fmtPct } from '@/lib/metrics';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const thesisCards = [
  {
    number: '01',
    title: 'Adaptive Allocation',
    text: 'BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior.',
  },
  {
    number: '02',
    title: 'Benchmark Discipline',
    text: 'Every model is evaluated against transparent market benchmarks and normalized performance curves.',
  },
  {
    number: '03',
    title: 'Risk First',
    text: 'Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions.',
  },
  {
    number: '04',
    title: 'Execution Transparency',
    text: 'Orders, positions, target weights, and decisions are logged and visible from the same source of truth.',
  },
];

const frameworkSteps = [
  {
    step: '01',
    title: 'Signal Generation',
    text: 'Momentum, sentiment, macro, alt-data, and mean-reversion signals are computed in real time across the portfolio universe.',
  },
  {
    step: '02',
    title: 'Risk Assessment',
    text: 'Before allocation, drawdown limits, concentration checks, and stress conditions are validated against the live account.',
  },
  {
    step: '03',
    title: 'Benchmark Evaluation',
    text: 'Each strategy is continuously compared against transparent benchmarks to verify genuine alpha generation.',
  },
  {
    step: '04',
    title: 'Execution & Audit',
    text: 'Every order, rebalance, and model decision is recorded with rationale for full transparency from signal to settlement.',
  },
];

const approachCards = [
  {
    title: 'Fundamental Analysis',
    text: 'We analyze fundamental, market, and alternative data, using NLP on earnings calls and management commentary to extract alpha signals.',
  },
  {
    title: 'Quantitative Finance',
    text: 'Mathematical and statistical techniques detect patterns, volatility structures, and pricing anomalies across the universe.',
  },
  {
    title: 'Reinforcement Learning',
    text: 'Our BR-PPO model continuously learns from market interactions, self-improving signal weights and allocation decisions.',
  },
  {
    title: 'Behavioral Sciences',
    text: 'ML-driven analysis of investor biases, sentiment extremes, and crowd psychology helps exploit market mispricing.',
  },
];

const benchmarkFallback = [
  { name: 'S&P 500', ticker: 'SPY', color: '#cbd5f5' },
  { name: 'Nasdaq 100', ticker: 'QQQ', color: '#a5b4fc' },
  { name: 'Dow Jones', ticker: 'DIA', color: '#fca5a5' },
  { name: 'Russell 2000', ticker: 'IWM', color: '#fbbf24' },
  { name: 'Total US Market', ticker: 'VTI', color: '#67e8f9' },
];

const benchmarkColorOverrides: Record<string, string> = {
  SPY: '#cbd5f5',
  QQQ: '#a5b4fc',
  DIA: '#fca5a5',
  IWM: '#fbbf24',
  VTI: '#67e8f9',
};

function useReveal(threshold = 0.2) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node || visible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setVisible(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, visible]);

  return { ref, visible };
}

function prettyModelName(value: unknown) {
  if (typeof value === 'string' && value.trim()) return value;
  return 'Live Strategy';
}

export default function ResearchPage() {
  const strategyReveal = useReveal(0.25);
  const thesisReveal = useReveal(0.2);
  const frameworkReveal = useReveal(0.2);
  const performanceReveal = useReveal(0.2);
  const approachReveal = useReveal(0.2);
  const ctaReveal = useReveal(0.2);

  const { data } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 });

  const selectedModel = useMemo(() => {
    const models = Array.isArray(data?.modelComparison) ? data.modelComparison : [];
    return (
      models.find((model: any) => String(model?.id) === String(data?.selectedModel)) || models[0] || null
    );
  }, [data]);

  const stats = selectedModel?.stats || {};
  const annualizedReturn = stats?.annualizedReturn ?? stats?.totalReturn ?? null;
  const sharpe = stats?.sharpe ?? null;
  const hitRate = stats?.hitRate ?? null;
  const maxDrawdown = stats?.maxDrawdown ?? null;

  const benchmarkRows = useMemo(() => {
    const benchmarks = Array.isArray(data?.benchmarks) && data.benchmarks.length ? data.benchmarks : benchmarkFallback;

    const rows = [
      {
        name: selectedModel?.name || 'Qsentia MLEQ',
        value: stats?.totalReturn ?? null,
        color: '#8d82ff',
      },
      ...benchmarks.map((benchmark: any) => {
        const ticker = String(benchmark?.ticker || '').toUpperCase();

        return {
          name: benchmark?.name || ticker || 'Benchmark',
          value: benchmark?.stats?.totalReturn ?? null,
          color: benchmarkColorOverrides[ticker] || benchmark?.color || '#8b91ad',
        };
      }),
    ];

    const maxValue = Math.max(
      0.05,
      ...rows.map((row) => (Number.isFinite(row.value) ? Math.abs(row.value) : 0))
    );

    return rows.map((row) => ({
      ...row,
      width: row.value === null ? 12 : Math.max(12, Math.round((Math.abs(row.value) / maxValue) * 100)),
    }));
  }, [data, selectedModel, stats]);

  const selectedModelName = prettyModelName(selectedModel?.name || data?.selectedModel);
  const portfolioLabel = fmtPct(annualizedReturn, true);
  const winRateLabel = fmtPct(hitRate);
  const drawdownLabel = fmtPct(maxDrawdown, true);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#070815] text-[#edf0fb]">
      <QSentiaMotionBackground />

      <nav className="sticky top-0 z-50 border-b border-white/8 bg-[#070815]/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="flex items-center gap-4">
            <QSentiaLogo
              theme="dark"
              alt="Qsentia"
              width={220}
              height={72}
              priority
              className="h-10 w-auto opacity-95 sm:h-11"
            />
            <span className="hidden h-6 w-px bg-white/12 md:block" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.34em] text-[#8b91ad] md:block">
              Research Terminal
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#b9bed6]">
            <a href="#strategy" className="transition hover:text-white">Strategy</a>
            <a href="#framework" className="transition hover:text-white">Framework</a>
            <a href="#performance" className="transition hover:text-white">Performance</a>
            <a href="#approach" className="transition hover:text-white">Approach</a>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[#edf0fb] transition hover:border-[#8d82ff]/50 hover:bg-white/10"
            >
              Open Terminal
            </Link>
          </div>
        </div>
      </nav>

      <section
        id="strategy"
        ref={strategyReveal.ref}
        data-reveal
        className={`relative z-10 px-5 pb-20 pt-12 transition-all duration-700 md:px-6 md:pt-20 ${
          strategyReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b9bed6] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-[#8d82ff] shadow-[0_0_18px_rgba(141,130,255,0.55)]" />
              More Alpha, Less Risk
            </div>

            <div className="mb-8 flex items-center gap-5">
              <div className="flex h-16 w-16 items-center justify-center border border-white/12 bg-white/6 text-4xl font-black text-[#edf0fb] shadow-[0_30px_120px_rgba(10,12,30,0.55)] backdrop-blur-xl">
                Q
              </div>
              <div className="text-4xl font-black tracking-[0.64em] text-[#edf0fb] sm:text-5xl">SENTIA</div>
            </div>

            <h1 className="max-w-4xl text-[clamp(3.8rem,8vw,7.75rem)] font-light leading-[0.88] tracking-[-0.095em] text-[#f5f7ff]">
              More Alpha
              <br />
              <span className="text-[#b5adff]">Less Risk</span>
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#b9bed6] sm:text-xl">
              Qsentia combines BR-PPO reinforcement learning with live market intelligence to deliver institutional-grade quantitative alpha with disciplined risk control.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-[#8d82ff] px-8 py-4 text-sm font-semibold text-white shadow-[0_24px_80px_rgba(141,130,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#7b70f8]"
              >
                View Live Research Terminal
              </Link>
              <a
                href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia%20Investor%20Information%20Request"
                className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-8 py-4 text-sm font-semibold text-[#edf0fb] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#8d82ff]/50 hover:bg-white/10"
              >
                Request Information
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <MetricPill label="Annualised Alpha" value={portfolioLabel === 'Pending' ? 'Pending' : portfolioLabel} />
              <MetricPill label="Sharpe Ratio" value={fmtNum(sharpe, 2)} />
              <MetricPill label="Max Drawdown" value={drawdownLabel === 'Pending' ? 'Pending' : drawdownLabel} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-32 w-32 rounded-full bg-[#8d82ff]/14 blur-3xl" />
            <div className="absolute -right-4 bottom-16 h-40 w-40 rounded-full bg-[#7de3ff]/12 blur-3xl" />
            <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,17,36,0.86),rgba(9,10,24,0.95))] p-6 shadow-[0_40px_140px_rgba(5,7,18,0.72)] backdrop-blur-2xl">
              <div className="mb-6 flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8b91ad]">Live Portfolio Terminal</div>
                  <div className="mt-2 text-2xl font-light tracking-[-0.05em] text-white">{selectedModelName}</div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.55)]" />
                  Live
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <MetricPill label="Portfolio Alpha (12M)" value={fmtPct(data?.latest?.portfolioReturn ?? stats?.totalReturn, true)} />
                <MetricPill label="Win Rate" value={winRateLabel} />
                <MetricPill label="Active Signals" value={`${Number(stats?.nReturns ?? 0)} / 100`} />
                <MetricPill label="Account Status" value={data?.latest?.decision?.account_status || 'Pending'} />
              </div>

              <div className="mt-6 rounded-[28px] border border-white/8 bg-white/[0.03] p-5">
                <div className="mb-4 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8b91ad]">
                  <span>Returns vs Benchmarks</span>
                  <span>Normalized Performance</span>
                </div>
                <div className="space-y-4">
                  {benchmarkRows.map((row) => (
                    <div key={row.name}>
                      <div className="mb-2 flex items-center justify-between gap-4 text-sm text-[#edf0fb]">
                        <span className="truncate text-[#c7cadb]">{row.name}</span>
                        <span className="font-semibold text-white">{fmtPct(row.value, true)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/8">
                        <div className="h-2 rounded-full" style={{ width: `${row.width}%`, backgroundColor: row.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={thesisReveal.ref}
        data-reveal
        className={`relative z-10 px-5 py-8 transition-all duration-700 md:px-6 md:py-12 ${
          thesisReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Investment Framework"
            title="Our Investment Thesis"
            subtitle="Four pillars that form the backbone of every capital allocation decision we make."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {thesisCards.map((card) => (
              <ThesisCard key={card.number} {...card} />
            ))}
          </div>
        </div>
      </section>

      <section
        id="framework"
        ref={frameworkReveal.ref}
        data-reveal
        className={`relative z-10 px-5 py-8 transition-all duration-700 md:px-6 md:py-12 ${
          frameworkReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="How It Works"
            title="Guided by Insight, Driven by Discipline"
            subtitle="A controlled loop from signal generation to execution, built for institutional clarity."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {frameworkSteps.map((step) => (
                <div key={step.step} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
                  <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d82ff]">{step.step}</div>
                  <h3 className="text-xl font-light tracking-[-0.04em] text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#b9bed6]">{step.text}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,17,36,0.88),rgba(9,10,24,0.98))] p-6 shadow-[0_30px_120px_rgba(5,7,18,0.6)]">
              <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#8b91ad]">Signal Strength</div>
              <div className="space-y-4">
                {[
                  { label: 'Momentum', value: 82 },
                  { label: 'Mean Reversion', value: 67 },
                  { label: 'Sentiment NLP', value: 74 },
                  { label: 'Macro', value: 55 },
                  { label: 'Alt Data', value: 91 },
                ].map((item) => (
                  <div key={item.label} className="grid grid-cols-[110px_1fr_40px] items-center gap-3">
                    <div className="text-sm text-[#c7cadb]">{item.label}</div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div className="h-2 rounded-full bg-[#8d82ff]" style={{ width: `${item.value}%` }} />
                    </div>
                    <div className="text-right text-[11px] font-semibold text-[#8d82ff]">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-[24px] border border-[#8d82ff]/15 bg-[#8d82ff]/8 p-5 text-sm leading-7 text-[#edf0fb]">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b5adff]">BR-PPO Decision</div>
                Increase equity allocation by 12 percent because momentum and alt-data confluence cleared the model threshold.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="performance"
        ref={performanceReveal.ref}
        data-reveal
        className={`relative z-10 px-5 py-8 transition-all duration-700 md:px-6 md:py-12 ${
          performanceReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Track Record"
            title="Numbers that speak for themselves"
            subtitle="Verified performance metrics across live strategies, normalized for fast comparison and clearer diligence."
          />

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Annualised Return" value={portfolioLabel} detail="Above benchmark spread" />
            <StatCard label="Sharpe Ratio" value={fmtNum(sharpe, 2)} detail="Risk-adjusted outperformance" />
            <StatCard label="Win Rate" value={winRateLabel} detail="Across live trades" />
            <StatCard label="Max Drawdown" value={drawdownLabel} detail="Worst peak-to-trough" />
          </div>

          <div className="mt-6 rounded-[32px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b91ad]">Returns vs Benchmarks</div>
                <div className="mt-1 text-sm text-[#b9bed6]">Normalized comparison for the live strategy and major US benchmarks.</div>
              </div>
            </div>

            <div className="space-y-4">
              {benchmarkRows.map((row) => (
                <div key={row.name}>
                  <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                    <span className="text-[#c7cadb]">{row.name}</span>
                    <span className="font-semibold text-white">{fmtPct(row.value, true)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8">
                    <div className="h-2 rounded-full" style={{ width: `${row.width}%`, backgroundColor: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="approach"
        ref={approachReveal.ref}
        data-reveal
        className={`relative z-10 px-5 py-8 transition-all duration-700 md:px-6 md:py-12 ${
          approachReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Methodology"
            title="Guided by Insight, Built on Science"
            subtitle="A multi-disciplinary framework that bridges human intuition and machine intelligence."
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {approachCards.map((card) => (
              <div key={card.title} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
                <div className="text-lg font-light tracking-[-0.04em] text-white">{card.title}</div>
                <p className="mt-3 text-sm leading-7 text-[#b9bed6]">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        ref={ctaReveal.ref}
        data-reveal
        className={`relative z-10 px-5 py-14 transition-all duration-700 md:px-6 md:py-20 ${
          ctaReveal.visible ? 'reveal-visible' : ''
        }`}
      >
        <div className="mx-auto max-w-5xl rounded-[36px] border border-white/10 bg-[linear-gradient(180deg,rgba(22,24,48,0.88),rgba(10,11,24,0.98))] px-6 py-12 text-center shadow-[0_36px_140px_rgba(4,6,16,0.72)] md:px-10">
          <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8b91ad]">Get Started</div>
          <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.5rem)] font-light leading-[0.98] tracking-[-0.08em] text-white">
            Start investing with an intelligent edge
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#b9bed6] md:text-lg">
            Join investors who trust Qsentia&apos;s reinforcement learning platform. Institutional-grade tools, consumer-grade clarity.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full bg-[#8d82ff] px-8 py-4 text-sm font-semibold text-white shadow-[0_24px_80px_rgba(141,130,255,0.28)] transition hover:-translate-y-0.5 hover:bg-[#7b70f8]"
            >
              View Live Research Terminal
            </Link>
            <a
              href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia%20Investor%20Information%20Request"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-8 py-4 text-sm font-semibold text-[#edf0fb] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[#8d82ff]/50 hover:bg-white/10"
            >
              Request Information
            </a>
          </div>

          <div className="mt-4 text-xs text-[#8b91ad]">No spam, no pressure.</div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8 bg-[#070815]/92 px-5 py-10 backdrop-blur-xl md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_0.7fr_0.7fr]">
          <div>
            <div className="flex items-center gap-3">
              <QSentiaLogo theme="dark" alt="Qsentia" width={220} height={72} className="h-10 w-auto opacity-95 sm:h-11" />
              <span className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8b91ad]">Qsentia</span>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#8b91ad]">
              Intelligent reinforcement learning for quantitative finance. Where machine precision meets market perception.
            </p>
            <p className="mt-4 text-xs text-[#6f7692]">© 2026 QSentia. All rights reserved.</p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white">Product</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[#8b91ad]">
              <a href="#strategy" className="transition hover:text-white">Research Terminal</a>
              <a href="#framework" className="transition hover:text-white">Investment Thesis</a>
              <a href="#performance" className="transition hover:text-white">Performance</a>
              <a href="#approach" className="transition hover:text-white">Methodology</a>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white">Legal</div>
            <div className="mt-4 flex flex-col gap-3 text-sm text-[#8b91ad]">
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="transition hover:text-white">Contact</a>
              <a href="#" className="transition hover:text-white">Privacy Policy</a>
              <a href="#" className="transition hover:text-white">Disclaimer</a>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-white/8 pt-6 text-xs text-[#6f7692] md:flex-row md:items-center md:justify-between">
          <span>Investments in securities are subject to market risk. Past performance is not indicative of future results.</span>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="transition hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-3xl">
      <div className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8d82ff]">{eyebrow}</div>
      <h2 className="mt-3 text-[clamp(2rem,4vw,4rem)] font-light leading-[1] tracking-[-0.07em] text-white">{title}</h2>
      <p className="mt-4 text-base leading-8 text-[#b9bed6]">{subtitle}</p>
    </div>
  );
}

function ThesisCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-[#8d82ff]/30 hover:bg-white/[0.06]">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#8d82ff]/12 blur-3xl" />
      <div className="relative text-[10px] font-semibold uppercase tracking-[0.34em] text-[#8d82ff]">{number}</div>
      <h3 className="relative mt-6 text-2xl font-light tracking-[-0.05em] text-white">{title}</h3>
      <p className="relative mt-4 text-sm leading-7 text-[#b9bed6]">{text}</p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b91ad]">{label}</div>
      <div className="mt-2 text-lg font-light tracking-[-0.04em] text-white">{value}</div>
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl">
      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#8b91ad]">{label}</div>
      <div className="mt-4 text-3xl font-light tracking-[-0.06em] text-white">{value}</div>
      <div className="mt-2 text-sm text-[#b9bed6]">{detail}</div>
    </div>
  );
}