'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { fmtNum, fmtPct } from '@/lib/metrics';
import '../src/styles/vibrant-theme.css';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function percentLabel(value: number | null | undefined) {
  const formatted = fmtPct(value);
  return formatted === 'Pending' ? formatted : formatted.replace('%', '');
}

const frameworkSteps = [
  {
    title: 'Signal Generation',
    desc: 'Momentum, sentiment, macro, alt-data, and mean-reversion signals are computed in real-time across 300+ instruments and scored by the BR-PPO engine.',
  },
  {
    title: 'Risk Assessment',
    desc: 'Before allocation, drawdown limits, VaR thresholds, and position concentration checks are run against live portfolio state and stress scenarios.',
  },
  {
    title: 'Benchmark Evaluation',
    desc: 'Every strategy is continuously compared against benchmarks to verify genuine alpha generation before positions are confirmed.',
  },
  {
    title: 'Execution & Audit',
    desc: 'Every order, rebalance event, and model decision is recorded with rationale — full transparency from signal to settlement.',
  },
];

const pillars = [
  {
    number: '01',
    icon: 'allocation',
    title: 'Adaptive Allocation',
    desc: 'BR-PPO dynamically shifts exposure based on live portfolio state, model signals, and risk behavior.',
  },
  {
    number: '02',
    icon: 'benchmark',
    title: 'Benchmark Discipline',
    desc: 'Every model is evaluated against transparent market benchmarks and normalized performance curves.',
  },
  {
    number: '03',
    icon: 'shield',
    title: 'Risk First',
    desc: 'Drawdown, volatility, hit rate, and model health are visible before capital allocation decisions.',
  },
  {
    number: '04',
    icon: 'audit',
    title: 'Execution Transparency',
    desc: 'Orders, positions, target weights, and decisions are logged and visible from the same source of truth.',
  },
];

const approachCards = [
  {
    icon: 'analysis',
    title: 'Fundamental Analysis',
    desc: 'We analyze fundamental, market, and alternative data, using NLP on earnings calls and management commentary to extract alpha signals.',
  },
  {
    icon: 'quant',
    title: 'Quantitative Finance',
    desc: 'Mathematical and statistical techniques detect patterns, volatility structures, and pricing anomalies across the universe.',
  },
  {
    icon: 'rl',
    title: 'Reinforcement Learning',
    desc: 'Our BR-PPO model continuously learns from market interactions, self-improving signal weights and allocation decisions.',
  },
  {
    icon: 'lab',
    title: 'Behavioral Sciences',
    desc: 'ML-driven analysis of investor biases, sentiment extremes, and crowd psychology to exploit market mispricing.',
  },
];

const iconStroke = 'currentColor';

function Icon({ name, className }: { name: string; className?: string }) {
  const common = {
    className,
    fill: 'none',
    stroke: iconStroke,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'allocation':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 6h16" />
          <path d="M6 6v12" />
          <path d="M12 6v8" />
          <path d="M18 6v4" />
          <path d="M5 20h14" />
        </svg>
      );
    case 'benchmark':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 18V6" />
          <path d="M10 18V9" />
          <path d="M16 18V4" />
          <path d="M3 18h18" />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
          <path d="M9.5 12.5l1.5 1.5 3.5-3.5" />
        </svg>
      );
    case 'audit':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 4h7l3 3v13H7z" />
          <path d="M14 4v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      );
    case 'analysis':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="M7 15l3-4 3 2 4-6" />
          <circle cx="7" cy="15" r="1" />
          <circle cx="10" cy="11" r="1" />
          <circle cx="13" cy="13" r="1" />
          <circle cx="17" cy="7" r="1" />
        </svg>
      );
    case 'quant':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M5 19l5-14" />
          <path d="M14 5l5 14" />
          <path d="M7.5 13h9" />
        </svg>
      );
    case 'rl':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="12" cy="10" r="3" />
          <path d="M4 20c2.5-3 5.5-4 8-4s5.5 1 8 4" />
          <path d="M12 3v3" />
        </svg>
      );
    case 'lab':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M9 3v5l-4 7a4 4 0 0 0 3.5 6h7a4 4 0 0 0 3.5-6l-4-7V3" />
          <path d="M9 8h6" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 3l2.6 5.2 5.8.8-4.2 4.1 1 5.9-5.2-2.7-5.2 2.7 1-5.9-4.2-4.1 5.8-.8z" />
        </svg>
      );
    case 'arrow':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 5v12" />
          <path d="M7 13l5 5 5-5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const { data } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 });

  const textPrimary = isDark ? 'text-white' : 'text-[#1a1a2e]';
  const textSecondary = isDark ? 'text-[#c4c4e8]' : 'text-[#4a4a72]';
  const textMuted = 'text-[#8888aa]';
  const accentText = isDark ? 'text-[#a5b4fc]' : 'text-[#4f46e5]';
  const pillClass = isDark
    ? 'bg-white/10 border-white/20 text-[#c4c4e8]'
    : 'bg-white/80 border-[#bdbdf7] text-[#4a4a72]';
  const cardClass = isDark ? 'bg-white/5 border-white/10' : 'bg-white/80 border-[#e0e0f7]';

  const selectedModel = useMemo(() => {
    const models = data?.modelComparison || [];
    const qsentia = models.find((m: any) => String(m?.name || '').toLowerCase().includes('qsentia'));
    const selected = models.find((m: any) => m.id === data?.selectedModel);
    return qsentia || selected || models[0] || null;
  }, [data]);

  const stats = selectedModel?.stats || {};
  const annualizedReturn = stats?.annualizedReturn ?? stats?.totalReturn;
  const sharpe = stats?.sharpe;
  const hitRate = stats?.hitRate;
  const maxDrawdown = stats?.maxDrawdown;
  const annualizedLabel = percentLabel(annualizedReturn);
  const hitRateLabel = percentLabel(hitRate);
  const drawdownLabel = percentLabel(maxDrawdown);

  const benchmarkBars = useMemo(() => {
    const bench = data?.benchmarks || [];
    const modelReturn = stats?.totalReturn ?? null;

    const rows = [
      {
        name: selectedModel?.name || 'Qsentia MLEQ',
        value: modelReturn,
        color: '#4f46e5',
      },
      ...bench.map((b: any) => ({
        name: b?.name || b?.ticker,
        value: b?.stats?.totalReturn ?? null,
        color: b?.color || '#6b7280',
      })),
    ];

    const maxValue = Math.max(
      0.05,
      ...rows.map((row) => (Number.isFinite(row.value) ? Math.abs(row.value) : 0))
    );

    return rows.map((row) => ({
      ...row,
      width: row.value === null ? 8 : Math.max(8, Math.round((Math.abs(row.value) / maxValue) * 100)),
    }));
  }, [data, selectedModel, stats]);

  return (
    <main className="relative min-h-screen overflow-x-hidden vibrant-bg pb-20">
      <QSentiaMotionBackground />

      {/* NAVIGATION */}
      <nav className="vibrant-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <Image
              src="/logo/Qsentia Logo Bg transparent.png"
              alt="QSentia Logo"
              width={200}
              height={60}
              className="h-10 w-auto"
              priority
            />
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#strategy" className="vibrant-nav-link">Strategy</a>
            <a href="#framework" className="vibrant-nav-link">Framework</a>
            <a href="#performance" className="vibrant-nav-link">Performance</a>
            <a href="#approach" className="vibrant-nav-link">Approach</a>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className="rounded-md border px-3 py-1 border-white/20 text-white hover:bg-white/10"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="rounded-md border px-3 py-1 border-[#00f2fe] text-[#00f2fe] hover:bg-[#00f2fe] hover:text-[#120b2e]">Contact</a>
          </div>
        </div>
      </nav>

      {/* FLOATING CTA */}
      <a href="/dashboard" className="floating-cta-vibrant">Get Started</a>

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center pt-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold shadow-sm backdrop-blur-md border-white/10 bg-white/10 text-white">
          <Icon name="star" className="h-4 w-4 text-[#00f2fe]" />
          Where intelligent reinforcement learning meets market perception
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-normal leading-tight mb-4 text-gradient-vibrant">
          More Alpha<br />
          <em className="not-italic text-gradient-shimmer">Less Risk</em>
        </h1>
        <p className="mx-auto mb-8 max-w-xl text-lg font-light text-white opacity-90">
          Qsentia combines advanced BR-PPO reinforcement learning with real-time market intelligence to deliver institutional-grade quantitative alpha to every investor.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/dashboard" className="px-8 py-3 rounded-lg bg-[#4f46e5] text-white font-semibold shadow hover:bg-[#4338ca] transition">View Live Research Terminal</Link>
          <a href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request" className={`px-8 py-3 rounded-lg border font-semibold transition ${isDark ? 'border-white/30 text-white bg-white/10 hover:bg-white/20' : 'border-[#4f46e5] text-[#4f46e5] bg-white/80 hover:bg-[#f4f4f9]'}`}>Request Information</a>
        </div>
        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-xs ${textMuted} animate-bounce`}>
          <div className="w-8 h-8 flex items-center justify-center border border-[#bdbdf7] rounded-full mb-1">
            <Icon name="arrow" className="h-4 w-4" />
          </div>
          Scroll
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="relative z-10 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-6 px-6">
          <div className="pending-card-vibrant">
            <div className="pending-value-vibrant">
              {annualizedLabel === 'Pending' ? (
                annualizedLabel
              ) : (
                <>
                  {annualizedLabel}
                  <span className="text-[#00f2fe]">%</span>
                </>
              )}
            </div>
            <div className="pending-label-vibrant">Annualised Alpha</div>
          </div>
          <div className="pending-card-vibrant">
            <div className="pending-value-vibrant">{fmtNum(sharpe, 2)}</div>
            <div className="pending-label-vibrant">Sharpe Ratio</div>
          </div>
          <div className="pending-card-vibrant">
            <div className="pending-value-vibrant">
              {hitRateLabel === 'Pending' ? (
                hitRateLabel
              ) : (
                <>
                  {hitRateLabel}
                  <span className="text-[#00f2fe]">%</span>
                </>
              )}
            </div>
            <div className="pending-label-vibrant">Signal Accuracy</div>
          </div>
          <div className="pending-card-vibrant">
            <div className="pending-value-vibrant">
              {drawdownLabel === 'Pending' ? (
                drawdownLabel
              ) : (
                <>
                  {drawdownLabel}
                  <span className="text-[#00f2fe]">%</span>
                </>
              )}
            </div>
            <div className="pending-label-vibrant">Max Drawdown</div>
          </div>
        </div>
      </div>

      {/* STRATEGY SECTION */}
      <section id="strategy" className="relative z-10 py-24 bg-transparent">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="mb-2 font-bold uppercase tracking-widest text-xs text-[#00f2fe]">Investment Strategy</div>
          <h2 className="font-serif text-3xl md:text-5xl mb-8 text-white">Machine Learning<br />Equity Quant (MLEQ)</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center mt-8">
            <div>
              <div className="flex gap-8 mb-6">
                <div>
                  <div className="font-serif text-2xl text-white">5<span className="text-[#f093fb]">+</span></div>
                  <div className="text-xs text-[#94a3b8]">Alpha Signal Families</div>
                </div>
                <div>
                  <div className="font-serif text-2xl text-white">40<span className="text-[#f093fb]">+</span></div>
                  <div className="text-xs text-[#94a3b8]">Data Sources</div>
                </div>
                <div>
                  <div className="font-serif text-2xl text-white">12<span className="text-[#f093fb]">M</span></div>
                  <div className="text-xs text-[#94a3b8]">Data Points Daily</div>
                </div>
              </div>
              <p className="mb-4 max-w-md text-[#cbd5e1]">
                Our high-conviction systematic strategy integrates deep data science with behavioral insights to identify outperformers. By leveraging AI to decode fundamental data and management sentiment, we uncover non-obvious alpha and deliver superior risk-adjusted returns.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">Adaptive Allocation</span>
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">Benchmark Discipline</span>
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">Risk First</span>
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">BR-PPO Engine</span>
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">Alt Data Signals</span>
                <span className="rounded-full px-4 py-1 text-xs glass-panel text-white">NLP Sentiment</span>
              </div>
            </div>
            <div className="rounded-2xl p-8 glass-panel text-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-[#94a3b8]">Live Portfolio Terminal</span>
                <span className="flex items-center gap-2 text-xs font-bold text-[#00f2fe]"><span className="w-2 h-2 bg-[#00f2fe] rounded-full animate-pulse shadow-[0_0_8px_#00f2fe]"></span>LIVE</span>
              </div>
              <div className="h-24 w-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 400 120" width="100%" height="100%" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f093fb" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f093fb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8 L400,120 L0,120Z" fill="url(#g1)" />
                  <path d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8" fill="none" stroke="#f093fb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="400" cy="8" r="5" fill="#f093fb" className="animate-pulse" />
                </svg>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm"><span className="text-[#94a3b8]">Portfolio Alpha (12M)</span><span className="text-[#00f2fe] font-mono font-bold">{fmtPct(stats?.totalReturn, true)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#94a3b8]">Sharpe Ratio</span><span className="text-white font-mono font-bold">{fmtNum(sharpe, 2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#94a3b8]">Max Drawdown</span><span className="text-[#f5576c] font-mono font-bold">{fmtPct(maxDrawdown, true)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#94a3b8]">Win Rate</span><span className="text-[#00f2fe] font-mono font-bold">{fmtPct(hitRate)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#94a3b8]">Active Signals</span><span className="text-white font-mono font-bold">{stats?.nReturns ?? 'Pending'} / 100</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="relative z-10 py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className="font-bold uppercase tracking-widest text-xs text-[#00f2fe]">Investment Framework</div>
            <h2 className="font-serif text-3xl md:text-5xl text-white mt-4">Our Investment Thesis</h2>
            <p className="mt-2 text-[#94a3b8]">Four pillars that form the backbone of every capital allocation decision we make.</p>
          </div>
          <div className="pillars-grid-vibrant">
            {pillars.map((pillar) => (
              <div key={pillar.number} className="pillar-card-vibrant">
                <div className="pillar-num-neon">{pillar.number}</div>
                <div className="h-10 w-10 mb-4 rounded-xl border flex items-center justify-center border-[rgba(255,255,255,0.2)] bg-white/5 text-white">
                  <Icon name={pillar.icon} className="h-5 w-5" />
                </div>
                <div className="font-serif text-xl mb-2 text-white">{pillar.title}</div>
                <p className="text-sm text-[#cbd5e1]">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section id="framework" className="relative z-10 py-24 bg-transparent">
        <div className="mx-auto max-w-5xl px-6">
          <div className="font-bold uppercase tracking-widest text-xs mb-2 text-[#f093fb]">How It Works</div>
          <h2 className="font-serif text-3xl md:text-5xl mb-8 text-white">Guided by Insight,<br />Driven by Discipline</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-2">
              {frameworkSteps.map((step, idx) => (
                <button
                  key={step.title}
                  className={`w-full text-left border-b py-4 transition border-white/10 ${activeStep === idx ? 'text-[#00f2fe]' : 'text-[#cbd5e1]'}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="flex gap-4">
                    <div className="font-mono text-xs opacity-60">{String(idx + 1).padStart(2, '0')}</div>
                    <div>
                      <div className="font-semibold">{step.title}</div>
                      <div className="text-sm mt-1 opacity-70">{step.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="rounded-2xl p-8 glass-panel text-white">
              <div className="text-xs uppercase tracking-widest mb-4 text-[#94a3b8]">Signal Strength</div>
              {activeStep === 0 && (
                <div className="space-y-3">
                  {[
                    { label: 'Momentum', val: 82 },
                    { label: 'Mean Reversion', val: 67 },
                    { label: 'Sentiment NLP', val: 74 },
                    { label: 'Macro', val: 55 },
                    { label: 'Alt Data', val: 91 },
                  ].map((row) => (
                    <div key={row.label} className="signal-anim-row">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-white">{row.label}</span>
                        <span className="text-xs font-bold text-[#f093fb]">{row.val}</span>
                      </div>
                      <div className="signal-bar-bg" style={{ '--target-width': `${row.val}%` } as React.CSSProperties}>
                        <div className="signal-bar-fill" />
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 rounded-lg glass-panel p-4 text-sm text-[#cbd5e1]">
                    <div className="text-xs font-bold mb-1 text-[#00f2fe]">BR-PPO DECISION</div>
                    Increase equity allocation by 12% — momentum and alt-data confluence at 91-score threshold.
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-white/10 pb-2"><span>Max Drawdown</span><span className="text-[#f5576c]">{fmtPct(maxDrawdown, true)}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span>Volatility (ann.)</span><span className="text-[#f093fb]">{fmtPct(stats?.volatility)}</span></div>
                  <div className="flex justify-between border-b border-white/10 pb-2"><span>VaR (95%)</span><span className="text-[#00f2fe]">{fmtPct(stats?.maxDrawdown)}</span></div>
                  <div className="flex justify-between"><span>Hit Rate</span><span className="text-[#00f2fe]">{fmtPct(hitRate)}</span></div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-3 text-sm">
                  {benchmarkBars.slice(0, 4).map((row) => (
                    <div key={row.name} className="flex justify-between border-b border-white/10 pb-2">
                      <span>{row.name}</span>
                      <span className="text-[#00f2fe]">{fmtPct(row.value, true)}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-[#00f2fe] font-semibold">BUY · HDFC Bank</span><span className="text-[#94a3b8]">09:32:14</span></div>
                    150 qty @ 1642.50 — Momentum 88/100, Allocation +2.1%
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-[#f5576c] font-semibold">SELL · Wipro</span><span className="text-[#94a3b8]">10:15:08</span></div>
                    300 qty @ 458.20 — Stop-loss triggered at −4% drawdown limit
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section id="performance" className="relative z-10 py-24 text-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-[#f093fb] font-bold uppercase tracking-widest text-xs">Track Record</div>
          <h2 className="font-serif text-3xl md:text-5xl mt-2">Numbers that speak<br />for themselves</h2>
          <p className="text-[#cbd5e1] mt-3 max-w-xl">Verified performance metrics across all live strategies, audited quarterly by independent custodians.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="glass-panel p-6">
              <div className="text-xs uppercase tracking-widest text-[#94a3b8]">Annualised Return</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(annualizedReturn)}</div>
              <div className="text-sm text-[#00f2fe] mt-2">Above benchmark spread</div>
            </div>
            <div className="glass-panel p-6">
              <div className="text-xs uppercase tracking-widest text-[#94a3b8]">Sharpe Ratio</div>
              <div className="font-serif text-4xl mt-2">{fmtNum(sharpe, 2)}</div>
              <div className="text-sm text-[#00f2fe] mt-2">Risk-adjusted outperformance</div>
            </div>
            <div className="glass-panel p-6">
              <div className="text-xs uppercase tracking-widest text-[#94a3b8]">Win Rate</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(hitRate)}</div>
              <div className="text-sm text-[#cbd5e1] mt-2">Across live trades</div>
            </div>
            <div className="glass-panel p-6">
              <div className="text-xs uppercase tracking-widest text-[#94a3b8]">Max Drawdown</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(maxDrawdown, true)}</div>
              <div className="text-sm text-[#cbd5e1] mt-2">Worst peak-to-trough</div>
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs uppercase tracking-widest text-[#94a3b8] mb-4">Returns vs Benchmarks</div>
            <div className="space-y-4">
              {benchmarkBars.map((row) => (
                <div key={row.name}>
                  <div className="flex justify-between text-sm text-[#e2e8f0] mb-1">
                    <span>{row.name}</span>
                    <span>{fmtPct(row.value, true)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-2 rounded-full" style={{ width: `${row.width}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="relative z-10 py-24 bg-transparent border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="font-bold uppercase tracking-widest text-xs text-[#00f2fe]">Methodology</div>
          <h2 className="font-serif text-3xl md:text-5xl mt-2 text-white">Guided by Insight,<br />Built on Science</h2>
          <p className="mt-2 max-w-xl text-[#cbd5e1]">A multi-disciplinary framework that bridges human intuition and machine intelligence.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {approachCards.map((card) => (
              <div key={card.title} className="glass-panel p-6 flex gap-4 transition hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,242,254,0.15)]">
                <div className="h-10 w-10 shrink-0 rounded-xl border flex items-center justify-center border-white/20 bg-white/5 text-[#00f2fe]">
                  <Icon name={card.icon} className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold text-white">{card.title}</div>
                  <p className="text-sm mt-1 text-[#cbd5e1]">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 py-16 bg-[#0a0618] text-[#94a3b8] border-t border-white/5">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid md:grid-cols-4 gap-8 border-b border-white/10 pb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo/Qsentia Logo Bg transparent.png"
                  alt="QSentia Logo"
                  width={200}
                  height={60}
                  className="h-10 w-auto filter brightness-110"
                />
              </div>
              <p className="text-sm text-[#6666aa]">Intelligent reinforcement learning for quantitative finance. Where machine precision meets market perception.</p>
              <p className="text-xs text-[#5555aa] mt-4">© 2026 QSentia. All rights reserved.</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[#f093fb] mb-3">Product</div>
              <a href="#strategy" className="block text-sm text-[#94a3b8] mb-2 hover:text-[#00f2fe]">Research Terminal</a>
              <a href="#pillars" className="block text-sm text-[#94a3b8] mb-2 hover:text-[#00f2fe]">Investment Thesis</a>
              <a href="#performance" className="block text-sm text-[#94a3b8] mb-2 hover:text-[#00f2fe]">Performance</a>
              <a href="#approach" className="block text-sm text-[#94a3b8] hover:text-[#00f2fe]">Methodology</a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-[#f093fb] mb-3">Legal</div>
              <a href="#" className="block text-sm text-[#94a3b8] mb-2 hover:text-[#00f2fe]">Privacy Policy</a>
              <a href="#" className="block text-sm text-[#94a3b8] mb-2 hover:text-[#00f2fe]">Disclaimer</a>
              <a href="#" className="block text-sm text-[#94a3b8] hover:text-[#00f2fe]">Code of Conduct</a>
            </div>
          </div>
          <div className="text-xs text-[#44446a] flex flex-col md:flex-row justify-between items-start md:items-center pt-6">
            <span>Investments in securities are subject to market risk. Past performance is not indicative of future results.</span>
            <div className="flex gap-4 mt-3 md:mt-0">
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="hover:text-[#00f2fe]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}