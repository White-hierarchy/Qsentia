'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useMemo, useState, useEffect } from 'react';
import { fmtNum, fmtPct } from '@/lib/metrics';
import '../src/styles/citadel-theme.css';

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
  const { data } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
    
    return () => observer.disconnect();
  }, []);

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
    <main className="relative min-h-screen overflow-x-hidden citadel-bg pb-20 font-sans">
      {/* NAVIGATION */}
      <nav className="citadel-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center">
            <Image
              src="/logo/Qsentia Logo Bg transparent.png"
              alt="QSentia Logo"
              width={400}
              height={120}
              className="h-16 md:h-20 w-auto invert"
              priority
            />
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#strategy" className="citadel-nav-link">Strategy</a>
            <a href="#framework" className="citadel-nav-link">Framework</a>
            <a href="#performance" className="citadel-nav-link">Performance</a>
            <a href="#approach" className="citadel-nav-link">Approach</a>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="text-sm font-semibold tracking-wider uppercase text-[#2563eb] hover:text-[#1e3a8a] transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center pt-10 pb-32">
        <div className="animate-on-scroll fade-in-up mb-8 inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-500 uppercase tracking-widest border-b border-gray-200">
          <Icon name="star" className="h-4 w-4 text-[#2563eb]" />
          Intelligent reinforcement learning & market perception
        </div>
        <h1 className="animate-on-scroll fade-in-up delay-200 text-citadel-heading text-5xl md:text-8xl leading-[1.1] mb-6 max-w-5xl mx-auto">
          More Alpha <br />
          Less Risk
        </h1>
        <p className="animate-on-scroll fade-in-up delay-300 mx-auto mb-10 max-w-2xl text-lg md:text-xl font-light text-citadel-subheading leading-relaxed">
          Qsentia combines advanced BR-PPO reinforcement learning with real-time market intelligence to deliver institutional-grade quantitative alpha to every investor.
        </p>
        <div className="animate-on-scroll scale-in delay-400 flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <Link href="/dashboard" className="citadel-btn-primary">View Live Research Terminal</Link>
          <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="citadel-btn-secondary">Request Information</a>
        </div>
      </section>

      {/* STAT STRIP */}
      <div className="relative z-10 py-16 -mt-32">
        <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4 gap-6 px-6">
          <div className="pending-card-citadel animate-on-scroll fade-in-up">
            <div className="pending-value-citadel">
              {annualizedLabel === 'Pending' ? (
                annualizedLabel
              ) : (
                <>
                  {annualizedLabel}
                  <span className="text-gray-400 text-2xl">%</span>
                </>
              )}
            </div>
            <div className="pending-label-citadel">Annualised Alpha</div>
          </div>
          <div className="pending-card-citadel animate-on-scroll fade-in-up delay-100">
            <div className="pending-value-citadel">{fmtNum(sharpe, 2)}</div>
            <div className="pending-label-citadel">Sharpe Ratio</div>
          </div>
          <div className="pending-card-citadel animate-on-scroll fade-in-up delay-200">
            <div className="pending-value-citadel">
              {hitRateLabel === 'Pending' ? (
                hitRateLabel
              ) : (
                <>
                  {hitRateLabel}
                  <span className="text-gray-400 text-2xl">%</span>
                </>
              )}
            </div>
            <div className="pending-label-citadel">Signal Accuracy</div>
          </div>
          <div className="pending-card-citadel animate-on-scroll fade-in-up delay-300">
            <div className="pending-value-citadel">
              {drawdownLabel === 'Pending' ? (
                drawdownLabel
              ) : (
                <>
                  {drawdownLabel}
                  <span className="text-gray-400 text-2xl">%</span>
                </>
              )}
            </div>
            <div className="pending-label-citadel">Max Drawdown</div>
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
      <section id="pillars" className="relative z-10 py-24 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 animate-on-scroll fade-in-up">
            <div className="font-bold uppercase tracking-widest text-xs text-[#2563eb]">Investment Framework</div>
            <h2 className="font-serif text-3xl md:text-5xl text-[#111827] mt-4 mb-4">Our Investment Thesis</h2>
            <p className="text-gray-500 font-light max-w-xl mx-auto">Four pillars that form the backbone of every capital allocation decision we make.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {pillars.map((pillar, idx) => (
              <div key={pillar.number} className={`citadel-card animate-on-scroll fade-in-up delay-${(idx + 1) * 100}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-lg bg-[#f0f4ff] flex items-center justify-center text-[#2563eb]">
                    <Icon name={pillar.icon} className="h-6 w-6" />
                  </div>
                  <div className="font-serif text-3xl font-bold text-gray-200">{pillar.number}</div>
                </div>
                <h3 className="text-xl font-serif font-medium text-[#111827] mb-3">{pillar.title}</h3>
                <p className="text-gray-600 font-light leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section id="framework" className="relative z-10 py-24 bg-white">
        <div className="mx-auto max-w-5xl px-6">
          <div className="font-bold uppercase tracking-widest text-xs mb-2 text-[#2563eb] animate-on-scroll fade-in-left">How It Works</div>
          <h2 className="font-serif text-3xl md:text-5xl mb-12 text-[#111827] animate-on-scroll fade-in-left delay-100">Guided by Insight,<br />Driven by Discipline</h2>
          <div className="grid md:grid-cols-2 gap-12 mt-8">
            <div className="space-y-2 animate-on-scroll fade-in-up delay-200">
              {frameworkSteps.map((step, idx) => (
                <button
                  key={step.title}
                  className={`w-full text-left border-b py-5 transition-colors ${activeStep === idx ? 'border-[#2563eb] text-[#2563eb]' : 'border-gray-100 text-gray-500 hover:text-[#111827]'}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="flex gap-4">
                    <div className="font-mono text-sm opacity-50 mt-1">{String(idx + 1).padStart(2, '0')}</div>
                    <div>
                      <div className="font-medium text-lg mb-1">{step.title}</div>
                      <div className={`text-sm opacity-80 leading-relaxed font-light ${activeStep === idx ? 'text-gray-700' : 'text-gray-500'}`}>{step.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="citadel-card animate-on-scroll scale-in delay-300">
              <div className="text-xs uppercase tracking-widest mb-6 font-bold text-gray-500">Signal Strength</div>
              {activeStep === 0 && (
                <div className="space-y-4">
                  {[
                    { label: 'Momentum', val: 82 },
                    { label: 'Mean Reversion', val: 67 },
                    { label: 'Sentiment NLP', val: 74 },
                    { label: 'Macro', val: 55 },
                    { label: 'Alt Data', val: 91 },
                  ].map((row) => (
                    <div key={row.label} className="signal-anim-row animate-on-scroll">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-semibold text-gray-700 uppercase tracking-wider">{row.label}</span>
                        <span className="text-xs font-bold text-[#2563eb]">{row.val}</span>
                      </div>
                      <div className="signal-bar-bg-citadel">
                        <div className="signal-bar-fill-citadel" style={{ '--target-width': `${row.val}%` } as React.CSSProperties} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-8 rounded-lg bg-gray-50 border border-gray-100 p-5 text-sm text-gray-600 leading-relaxed">
                    <div className="text-xs font-bold mb-2 text-[#2563eb]">BR-PPO DECISION</div>
                    Increase equity allocation by 12% — momentum and alt-data confluence at 91-score threshold.
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-4 text-sm font-medium">
                  <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-gray-500 uppercase tracking-widest text-xs mt-1">Max Drawdown</span><span className="text-red-600 text-lg">{fmtPct(maxDrawdown, true)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-gray-500 uppercase tracking-widest text-xs mt-1">Volatility (ann.)</span><span className="text-gray-900 text-lg">{fmtPct(stats?.volatility)}</span></div>
                  <div className="flex justify-between border-b border-gray-100 pb-3"><span className="text-gray-500 uppercase tracking-widest text-xs mt-1">VaR (95%)</span><span className="text-green-600 text-lg">{fmtPct(stats?.maxDrawdown)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500 uppercase tracking-widest text-xs mt-1">Hit Rate</span><span className="text-green-600 text-lg">{fmtPct(hitRate)}</span></div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-4 text-sm">
                  {benchmarkBars.slice(0, 4).map((row) => (
                    <div key={row.name} className="flex justify-between items-center border-b border-gray-100 pb-3">
                      <span className="font-semibold text-gray-700">{row.name}</span>
                      <span className="text-[#2563eb] font-bold text-lg">{fmtPct(row.value, true)}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-4 text-sm">
                  <div className="rounded-lg bg-green-50 border border-green-100 p-4">
                    <div className="flex justify-between text-xs mb-2"><span className="text-green-700 font-bold uppercase tracking-wider">BUY · HDFC Bank</span><span className="text-gray-500">09:32:14</span></div>
                    <span className="text-gray-700">150 qty @ 1642.50 — Momentum 88/100, Allocation +2.1%</span>
                  </div>
                  <div className="rounded-lg bg-red-50 border border-red-100 p-4">
                    <div className="flex justify-between text-xs mb-2"><span className="text-red-700 font-bold uppercase tracking-wider">SELL · Wipro</span><span className="text-gray-500">10:15:08</span></div>
                    <span className="text-gray-700">300 qty @ 458.20 — Stop-loss triggered at −4% drawdown limit</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section id="performance" className="relative z-10 py-24 bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-[#2563eb] font-bold uppercase tracking-widest text-xs animate-on-scroll fade-in-left">Track Record</div>
          <h2 className="font-serif text-3xl md:text-5xl mt-4 text-[#111827] animate-on-scroll fade-in-left delay-100">Numbers that speak<br />for themselves</h2>
          <p className="text-gray-500 font-light mt-4 max-w-xl animate-on-scroll fade-in-left delay-200">Verified performance metrics across all live strategies, audited quarterly by independent custodians.</p>
          
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="citadel-card animate-on-scroll fade-in-up delay-300">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Annualised Return</div>
              <div className="font-serif text-5xl mt-2 text-[#111827]">{fmtPct(annualizedReturn)}</div>
              <div className="text-sm text-[#2563eb] font-medium mt-3">Above benchmark spread</div>
            </div>
            <div className="citadel-card animate-on-scroll fade-in-up delay-400">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Sharpe Ratio</div>
              <div className="font-serif text-5xl mt-2 text-[#111827]">{fmtNum(sharpe, 2)}</div>
              <div className="text-sm text-[#2563eb] font-medium mt-3">Risk-adjusted outperformance</div>
            </div>
            <div className="citadel-card animate-on-scroll fade-in-up delay-100">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Win Rate</div>
              <div className="font-serif text-5xl mt-2 text-[#111827]">{fmtPct(hitRate)}</div>
              <div className="text-sm text-gray-500 font-medium mt-3">Across live trades</div>
            </div>
            <div className="citadel-card animate-on-scroll fade-in-up delay-200">
              <div className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Max Drawdown</div>
              <div className="font-serif text-5xl mt-2 text-[#111827]">{fmtPct(maxDrawdown, true)}</div>
              <div className="text-sm text-gray-500 font-medium mt-3">Worst peak-to-trough</div>
            </div>
          </div>
          
          <div className="mt-16 bg-white p-8 rounded-xl border border-gray-100 shadow-sm animate-on-scroll scale-in delay-300">
            <div className="text-xs uppercase tracking-widest text-gray-800 font-bold mb-6">Returns vs Benchmarks</div>
            <div className="space-y-6">
              {benchmarkBars.map((row) => (
                <div key={row.name}>
                  <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                    <span>{row.name}</span>
                    <span>{fmtPct(row.value, true)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 w-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${row.width}%`, backgroundColor: row.color === '#4f46e5' ? '#2563eb' : row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section id="approach" className="relative z-10 py-24 bg-white">
        <div className="mx-auto max-w-6xl px-6">
          <div className="font-bold uppercase tracking-widest text-xs text-[#2563eb] animate-on-scroll fade-in-left">Methodology</div>
          <h2 className="font-serif text-3xl md:text-5xl mt-4 text-[#111827] animate-on-scroll fade-in-left delay-100">Guided by Insight,<br />Built on Science</h2>
          <p className="mt-4 max-w-xl text-gray-500 font-light animate-on-scroll fade-in-left delay-200">A multi-disciplinary framework that bridges human intuition and machine intelligence.</p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {approachCards.map((card, idx) => (
              <div key={card.title} className={`citadel-card flex gap-6 animate-on-scroll fade-in-up delay-${(idx + 1) * 100}`}>
                <div className="h-12 w-12 shrink-0 rounded-lg bg-[#f0f4ff] flex items-center justify-center text-[#2563eb]">
                  <Icon name={card.icon} className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-serif text-xl font-medium text-[#111827] mb-2">{card.title}</div>
                  <p className="font-light text-gray-600 leading-relaxed text-sm">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING CTA REMOVED AS REQUESTED TO CLEAN UP DESIGN */}

      {/* FOOTER */}
      <footer className="relative z-10 py-16 bg-[#111827] text-gray-400 border-t border-gray-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-4 gap-12 border-b border-gray-800 pb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Image
                  src="/logo/Qsentia Logo Bg transparent.png"
                  alt="QSentia Logo"
                  width={300}
                  height={90}
                  className="h-12 w-auto invert opacity-90"
                />
              </div>
              <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm">Intelligent reinforcement learning for quantitative finance. Where machine precision meets market perception.</p>
              <p className="text-xs text-gray-500 mt-6">© 2026 QSentia. All rights reserved.</p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-4">Product</div>
              <a href="#strategy" className="block text-sm text-gray-400 mb-3 hover:text-white transition-colors">Research Terminal</a>
              <a href="#pillars" className="block text-sm text-gray-400 mb-3 hover:text-white transition-colors">Investment Thesis</a>
              <a href="#performance" className="block text-sm text-gray-400 mb-3 hover:text-white transition-colors">Performance</a>
              <a href="#approach" className="block text-sm text-gray-400 hover:text-white transition-colors">Methodology</a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gray-300 font-bold mb-4">Legal</div>
              <a href="#" className="block text-sm text-gray-400 mb-3 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="block text-sm text-gray-400 mb-3 hover:text-white transition-colors">Disclaimer</a>
              <a href="#" className="block text-sm text-gray-400 hover:text-white transition-colors">Code of Conduct</a>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex flex-col md:flex-row justify-between items-start md:items-center pt-8">
            <span className="max-w-2xl font-light">Investments in securities are subject to market risk. Past performance is not indicative of future results.</span>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="hover:text-white font-medium uppercase tracking-widest transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}