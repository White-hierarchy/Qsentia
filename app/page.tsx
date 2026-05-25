'use client';

import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useEffect, useMemo, useRef, useState } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import { fmtNum, fmtPct } from '@/lib/metrics';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type HeatmapDay = {
  dateKey: string;
  label: string;
  value: number;
};

type BenchmarkBar = {
  name: string;
  value: number | null;
  color: string;
  width?: number;
};

type LeaderRow = {
  label: string;
  value: number;
  color: string;
};

function percentLabel(value: number | null | undefined) {
  const formatted = fmtPct(value);
  return formatted === 'Pending' ? formatted : formatted.replace('%', '');
}

function formatDateLabel(dateKey?: string | null) {
  if (!dateKey) return 'Pending';
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
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

const heatmapMonths = [
  'All Months',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
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
    case 'menu':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'close':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6l-12 12" />
        </svg>
      );
    default:
      return null;
  }
}

function heatClass(value: number, isDark: boolean) {
  if (value >= 0.02) return isDark ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-200 text-emerald-700';
  if (value >= 0.01) return isDark ? 'bg-emerald-400/25 text-emerald-200' : 'bg-emerald-100 text-emerald-700';
  if (value > 0) return isDark ? 'bg-emerald-300/20 text-emerald-200' : 'bg-emerald-50 text-emerald-700';
  if (value <= -0.02) return isDark ? 'bg-rose-500/30 text-rose-200' : 'bg-rose-200 text-rose-700';
  if (value <= -0.01) return isDark ? 'bg-rose-400/25 text-rose-200' : 'bg-rose-100 text-rose-700';
  return isDark ? 'bg-rose-300/15 text-rose-200' : 'bg-rose-50 text-rose-700';
}

export default function HomePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heatmapModel, setHeatmapModel] = useState('');
  const [heatmapMonth, setHeatmapMonth] = useState('All Months');
  const [heatmapYear, setHeatmapYear] = useState('All Years');
  const { data } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 });
  const { data: heatmapData } = useSWR(
    () => (heatmapModel ? `/api/dashboard?model=${encodeURIComponent(heatmapModel)}` : null),
    fetcher,
    { refreshInterval: 60000 }
  );
  const statsRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [statsInView, setStatsInView] = useState(false);
  const [chartInView, setChartInView] = useState(false);
  const strategyReveal = useReveal(0.25);
  const leadersReveal = useReveal(0.2);
  const pillarsReveal = useReveal(0.2);
  const frameworkReveal = useReveal(0.2);
  const performanceReveal = useReveal(0.2);
  const approachReveal = useReveal(0.2);
  const ctaReveal = useReveal(0.2);

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

  const alphaCount = useCountUp(5, statsInView);
  const sourcesCount = useCountUp(40, statsInView);
  const pointsCount = useCountUp(12, statsInView);

  useEffect(() => {
    const statsNode = statsRef.current;
    const chartNode = chartRef.current;
    const targets = [statsNode, chartNode].filter(Boolean) as HTMLElement[];

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === statsNode) setStatsInView(true);
          if (entry.target === chartNode) setChartInView(true);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 }
    );

    targets.forEach((target) => observer.observe(target));

    return () => observer.disconnect();
  }, []);


  const benchmarkBars = useMemo<BenchmarkBar[]>(() => {
    const bench = data?.benchmarks?.length ? data.benchmarks : benchmarkFallback;
    const modelReturn = Number.isFinite(Number(stats?.totalReturn)) ? Number(stats.totalReturn) : null;

    const rows: BenchmarkBar[] = [
      {
        name: selectedModel?.name || 'Qsentia MLEQ',
        value: modelReturn,
        color: '#4f46e5',
      },
      ...bench.map((b: any) => {
        const ticker = String(b?.ticker || '').toUpperCase();

        return {
          name: b?.name || ticker || 'Benchmark',
          value: Number.isFinite(Number(b?.stats?.totalReturn)) ? Number(b.stats.totalReturn) : null,
          color: benchmarkColorOverrides[ticker] || b?.color || '#6b7280',
        };
      }),
    ];

    const maxValue = Math.max(
      0.05,
      ...rows.map((row) => (row.value !== null ? Math.abs(row.value) : 0))
    );

    return rows.map((row): BenchmarkBar => ({
      ...row,
      width: row.value === null ? 8 : Math.max(8, Math.round((Math.abs(row.value) / maxValue) * 100)),
    }));
  }, [data, selectedModel, stats]);

  useEffect(() => {
    if (!heatmapModel && data?.selectedModel) {
      setHeatmapModel(data.selectedModel);
    }
  }, [data, heatmapModel]);

  const heatmapModelOptions = useMemo(() => data?.registry ?? [], [data]);

  const heatmapDays = useMemo<HeatmapDay[]>(() => {
    const source: Array<{ timestamp?: string; return?: number | string | null }> =
      heatmapData?.returns ?? data?.returns ?? [];

    return source
      .map((point) => {
        const dateKey = String(point.timestamp || '').slice(0, 10);
        const date = new Date(`${dateKey}T00:00:00Z`);

        if (!dateKey || Number.isNaN(date.getTime())) {
          return null;
        }

        return {
          dateKey,
          label: date.toLocaleString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          }),
          value: Number(point.return) || 0,
        };
      })
      .filter((day): day is HeatmapDay => day !== null)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  }, [data, heatmapData]);

  const heatmapYears = useMemo(() => {
    const years = new Set(
      heatmapDays.map((day) => new Date(`${day.dateKey}T00:00:00Z`).getFullYear().toString())
    );
    return ['All Years', ...Array.from(years).sort()];
  }, [heatmapDays]);

  const filteredHeatmapDays = useMemo(() => {
    return heatmapDays.filter((day) => {
      const date = new Date(`${day.dateKey}T00:00:00Z`);
      const matchesMonth =
        heatmapMonth === 'All Months' ||
        date.toLocaleString('en-US', { month: 'long' }) === heatmapMonth;
      const matchesYear =
        heatmapYear === 'All Years' ||
        date.getFullYear().toString() === heatmapYear;
      return matchesMonth && matchesYear;
    });
  }, [heatmapDays, heatmapMonth, heatmapYear]);

  const heatStats = useMemo(() => {
    const values = filteredHeatmapDays.map((day) => day.value);
    if (!values.length) {
      return {
        min: null,
        max: null,
        avg: null,
        positive: 0,
      };
    }
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    const positive = values.filter((v) => v > 0).length;

    return {
      min,
      max,
      avg,
      positive,
    };
  }, [filteredHeatmapDays]);

  const leaderboardCards = useMemo(() => {
    const latestReturn = data?.returns?.length ? data.returns[data.returns.length - 1] : null;
    const latestDate = latestReturn?.timestamp ? formatDateLabel(latestReturn.timestamp) : 'Today';
    const selectedConfig = data?.selectedModelConfig;
    const allTime = (data?.modelComparison || [])
      .filter((model: any) => Number.isFinite(model?.stats?.totalReturn))
      .sort((a: any, b: any) => (b.stats.totalReturn ?? 0) - (a.stats.totalReturn ?? 0))[0];

    return [
      {
        title: 'Best of Today',
        date: latestDate,
        model: selectedConfig?.name || 'Selected Model',
        return: latestReturn?.return ?? data?.stats?.totalReturn ?? null,
        sharpe: data?.stats?.sharpe ?? null,
        hitRate: data?.stats?.hitRate ?? null,
        badge: 'LIVE NOW',
      },
      {
        title: 'Best of All Time',
        date: allTime?.inceptionDate ? `${formatDateLabel(allTime.inceptionDate)} - Present` : 'All Time',
        model: allTime?.name || 'Top Model',
        return: allTime?.stats?.totalReturn ?? null,
        sharpe: allTime?.stats?.sharpe ?? null,
        hitRate: allTime?.stats?.hitRate ?? null,
        badge: 'ALL TIME',
      },
    ];
  }, [data]);

  const todayLeaders = useMemo<LeaderRow[]>(() => {
    const models = (data?.modelComparison || [])
      .map((model: any) => ({
        label: model?.name || model?.id,
        value: Number(model?.stats?.totalReturn),
        color: model?.color || '#4f46e5',
      }))
      .filter((row: LeaderRow) => Number.isFinite(row.value))
      .sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
      .slice(0, 5);

    return models;
  }, [data]);

  const todayTiles = useMemo(() => {
    const stats = data?.stats;
    const latest = data?.latest;
    const actions = Array.isArray(data?.actionCounts)
      ? data.actionCounts.reduce((sum: number, row: any) => sum + (row?.count ?? 0), 0)
      : null;

    return [
      {
        label: 'Portfolio Return',
        value: fmtPct(latest?.portfolioReturn ?? null, true),
        subLabel: latest?.paperStatus || 'Pending',
        tone: 'good',
      },
      {
        label: 'Sharpe Ratio',
        value: fmtNum(stats?.sharpe ?? null, 2),
        subLabel: stats?.status === 'ready' ? 'Ready' : 'Partial',
        tone: 'neutral',
      },
      {
        label: 'Hit Rate',
        value: fmtPct(stats?.hitRate ?? null),
        subLabel: `${stats?.nReturns ?? 0} returns`,
        tone: 'good',
      },
      {
        label: 'Max Drawdown',
        value: fmtPct(stats?.maxDrawdown ?? null, true),
        subLabel: 'Peak-to-trough',
        tone: 'bad',
      },
      {
        label: 'Volatility',
        value: fmtPct(stats?.volatility ?? null),
        subLabel: 'Annualized',
        tone: 'neutral',
      },
      {
        label: 'Signals Logged',
        value: actions !== null ? String(actions) : 'Pending',
        subLabel: 'Actions tracked',
        tone: 'neutral',
      },
    ];
  }, [data]);

  const heatmapModelName = useMemo(() => {
    return (
      heatmapModelOptions.find((model: { id: string; name: string }) => model.id === heatmapModel)
        ?.name ||
      data?.selectedModelConfig?.name ||
      'Return Heat Map'
    );
  }, [data, heatmapModel, heatmapModelOptions]);

  return (
    <main className={`relative min-h-screen overflow-x-hidden ${isDark ? 'bg-[#0e0c1e] text-white' : 'bg-[#fbfbfb] text-black'}`}>
      <QSentiaMotionBackground />

      {/* NAVIGATION */}
      <nav className={`fixed top-0 left-0 right-0 z-50 border-b ${isDark ? 'border-white/10 bg-[#11102a]/70' : 'border-[#e0e0f7] bg-white/70'} backdrop-blur-xl`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <div className="flex items-center">
            <Image
              src="/logo/qsentia-primary.png"
              alt="QSentia Logo"
              width={200}
              height={60}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#strategy" className={isDark ? 'text-[#c4c4e8] hover:text-white' : 'text-[#4a4a72] hover:text-[#4f46e5]'}>Strategy</a>
            <a href="#framework" className={isDark ? 'text-[#c4c4e8] hover:text-white' : 'text-[#4a4a72] hover:text-[#4f46e5]'}>Framework</a>
            <a href="#performance" className={isDark ? 'text-[#c4c4e8] hover:text-white' : 'text-[#4a4a72] hover:text-[#4f46e5]'}>Performance</a>
            <a href="#approach" className={isDark ? 'text-[#c4c4e8] hover:text-white' : 'text-[#4a4a72] hover:text-[#4f46e5]'}>Approach</a>
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`rounded-md border px-3 py-1 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white'}`}
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com" className={`rounded-md border px-3 py-1 ${isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-[#4f46e5] text-[#4f46e5] hover:bg-[#4f46e5] hover:text-white'}`}>Contact</a>
          </div>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`md:hidden rounded-md border p-2 ${isDark ? 'border-white/20 text-white' : 'border-[#4f46e5] text-[#4f46e5]'}`}
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} className="h-4 w-4" />
          </button>
        </div>
        {isMenuOpen && (
          <div className={`md:hidden border-t ${isDark ? 'border-white/10 bg-[#11102a]/95' : 'border-[#e0e0f7] bg-white/95'}`}>
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 text-sm">
              <a href="#strategy" className={isDark ? 'text-[#c4c4e8]' : 'text-[#4a4a72]'}>Strategy</a>
              <a href="#framework" className={isDark ? 'text-[#c4c4e8]' : 'text-[#4a4a72]'}>Framework</a>
              <a href="#performance" className={isDark ? 'text-[#c4c4e8]' : 'text-[#4a4a72]'}>Performance</a>
              <a href="#approach" className={isDark ? 'text-[#c4c4e8]' : 'text-[#4a4a72]'}>Approach</a>
              <button
                type="button"
                onClick={() => setIsDark((prev) => !prev)}
                className={`rounded-md border px-3 py-2 text-left ${isDark ? 'border-white/20 text-white' : 'border-[#4f46e5] text-[#4f46e5]'}`}
              >
                {isDark ? 'Light theme' : 'Dark theme'}
              </button>
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className={`rounded-md border px-3 py-2 ${isDark ? 'border-white/20 text-white' : 'border-[#4f46e5] text-[#4f46e5]'}`}>Contact</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center pt-28 sm:pt-32">
        <div className={`mb-8 inline-flex items-center gap-2 rounded-full border px-5 py-2 text-xs font-semibold shadow-sm backdrop-blur-md ${isDark ? 'border-white/10 bg-white/10 text-[#a5b4fc]' : 'border-[#bdbdf7] bg-white/80 text-[#4f46e5]'}`}>
          <Icon name="star" className="h-4 w-4" />
          Where intelligent reinforcement learning meets market perception
        </div>
        <h1 className={`font-serif text-5xl md:text-7xl font-normal leading-tight mb-4 ${textPrimary}`}>
          More Alpha<br />
          <em className={`not-italic ${accentText}`}>Less Risk</em>
        </h1>
        <p className={`mx-auto mb-8 max-w-xl text-base sm:text-lg font-light ${textSecondary}`}>
          Qsentia combines advanced BR-PPO reinforcement learning with real-time market intelligence to deliver institutional-grade quantitative alpha to every investor.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 w-full max-w-md sm:max-w-none">
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
      <div className={`relative z-10 backdrop-blur border-y py-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white/70 border-[#e0e0f7]'}`}>
        <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4 gap-6 px-6">
          <div className="text-center">
            <div className={`font-serif text-3xl ${textPrimary}`}>
              {annualizedLabel === 'Pending' ? (
                annualizedLabel
              ) : (
                <>
                  {annualizedLabel}
                  <span className={accentText}>%</span>
                </>
              )}
            </div>
            <div className={`text-xs mt-1 ${textMuted}`}>Annualised Alpha</div>
          </div>
          <div className="text-center">
            <div className={`font-serif text-3xl ${textPrimary}`}>{fmtNum(sharpe, 2)}</div>
            <div className={`text-xs mt-1 ${textMuted}`}>Sharpe Ratio</div>
          </div>
          <div className="text-center">
            <div className={`font-serif text-3xl ${textPrimary}`}>
              {hitRateLabel === 'Pending' ? (
                hitRateLabel
              ) : (
                <>
                  {hitRateLabel}
                  <span className={accentText}>%</span>
                </>
              )}
            </div>
            <div className={`text-xs mt-1 ${textMuted}`}>Signal Accuracy</div>
          </div>
          <div className="text-center">
            <div className={`font-serif text-3xl ${textPrimary}`}>
              {drawdownLabel === 'Pending' ? (
                drawdownLabel
              ) : (
                <>
                  {drawdownLabel}
                  <span className={accentText}>%</span>
                </>
              )}
            </div>
            <div className={`text-xs mt-1 ${textMuted}`}>Max Drawdown</div>
          </div>
        </div>
      </div>

      {/* STRATEGY SECTION */}
      <section
        id="strategy"
        ref={strategyReveal.ref}
        className={`relative z-10 py-24 bg-transparent ${strategyReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="container mx-auto max-w-5xl px-6">
          <div className={`mb-2 font-bold uppercase tracking-widest text-xs ${accentText}`}>Investment Strategy</div>
          <h2 className={`font-serif text-3xl md:text-5xl mb-8 ${textPrimary}`}>Machine Learning<br />Equity Quant (MLEQ)</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center mt-8">
            <div>
              <div ref={statsRef} className="flex gap-8 mb-6">
                <div>
                  <div className={`font-serif text-2xl ${textPrimary} ${statsInView ? 'count-up' : ''}`}>
                    {alphaCount}
                    <span className={accentText}>+</span>
                  </div>
                  <div className={`text-xs ${textMuted}`}>Alpha Signal Families</div>
                </div>
                <div>
                  <div className={`font-serif text-2xl ${textPrimary} ${statsInView ? 'count-up' : ''}`}>
                    {sourcesCount}
                    <span className={accentText}>+</span>
                  </div>
                  <div className={`text-xs ${textMuted}`}>Data Sources</div>
                </div>
                <div>
                  <div className={`font-serif text-2xl ${textPrimary} ${statsInView ? 'count-up' : ''}`}>
                    {pointsCount}
                    <span className={accentText}>M</span>
                  </div>
                  <div className={`text-xs ${textMuted}`}>Data Points Daily</div>
                </div>
              </div>
              <p className={`mb-4 max-w-md ${textSecondary}`}>
                Our high-conviction systematic strategy integrates deep data science with behavioral insights to identify outperformers. By leveraging AI to decode fundamental data and management sentiment, we uncover non-obvious alpha and deliver superior risk-adjusted returns.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>Adaptive Allocation</span>
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>Benchmark Discipline</span>
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>Risk First</span>
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>BR-PPO Engine</span>
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>Alt Data Signals</span>
                <span className={`rounded-full px-4 py-1 text-xs border ${pillClass}`}>NLP Sentiment</span>
              </div>
            </div>
            <div ref={chartRef} className={`rounded-2xl p-8 shadow-lg border ${cardClass}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-[#4a4a72]">Live Portfolio Terminal</span>
                <span className="flex items-center gap-2 text-xs font-bold text-green-600"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>LIVE</span>
              </div>
              <div className="h-24 w-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 400 120" width="100%" height="100%" preserveAspectRatio="none" className={chartInView ? 'chart-animate' : ''}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="chart-area" d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8 L400,120 L0,120Z" fill="url(#g1)" />
                  <path className="chart-line" d="M0,100 L22,96 L44,90 L66,94 L88,84 L110,78 L132,72 L154,76 L176,65 L198,58 L220,52 L242,48 L264,42 L286,36 L308,30 L330,24 L352,18 L374,14 L400,8" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle className="chart-dot" cx="400" cy="8" r="4" fill="#4f46e5" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm"><span className="text-[#4a4a72]">Portfolio Alpha (12M)</span><span className="text-green-600 font-mono font-semibold">{fmtPct(stats?.totalReturn, true)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#4a4a72]">Sharpe Ratio</span><span className="text-[#4f46e5] font-mono font-semibold">{fmtNum(sharpe, 2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#4a4a72]">Max Drawdown</span><span className="text-red-600 font-mono font-semibold">{fmtPct(maxDrawdown, true)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#4a4a72]">Win Rate</span><span className="text-green-600 font-mono font-semibold">{fmtPct(hitRate)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-[#4a4a72]">Active Signals</span><span className="text-[#4f46e5] font-mono font-semibold">{stats?.nReturns ?? 'Pending'} / 100</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD */}
      <section
        id="leaders"
        ref={leadersReveal.ref}
        className={`relative z-10 py-20 ${isDark ? 'bg-[#11102a]/60' : 'bg-white/60'} backdrop-blur ${leadersReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className={`font-bold uppercase tracking-widest text-xs ${accentText}`}>Performance Highlights</div>
          <h2 className={`font-serif text-3xl md:text-5xl mt-2 ${textPrimary}`}>Best of Today and Best of All Time</h2>
          <p className={`mt-3 max-w-2xl ${textSecondary}`}>
            Curated leaderboards spotlight the strategies delivering the strongest risk-adjusted outcomes right now and across the full record.
          </p>

          <div className="grid gap-6 mt-10 md:grid-cols-2">
            {leaderboardCards.map((card) => (
              <div key={card.title} className={`rounded-2xl border p-6 shadow-sm ${cardClass}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xs uppercase tracking-widest ${textMuted}`}>{card.title}</div>
                    <div className={`text-xs mt-1 ${textSecondary}`}>{card.date}</div>
                  </div>
                  <span className={`text-[11px] rounded-full border px-2 py-1 ${pillClass}`}>{card.badge}</span>
                </div>
                <div className={`mt-5 font-serif text-xl ${textPrimary}`}>{card.model}</div>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <div className={`text-xs ${textMuted}`}>Total Return</div>
                    <div className={`text-lg font-semibold ${accentText}`}>{fmtPct(card.return, true)}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Sharpe</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>{fmtNum(card.sharpe, 2)}</div>
                  </div>
                  <div>
                    <div className={`text-xs ${textMuted}`}>Hit Rate</div>
                    <div className={`text-lg font-semibold ${textPrimary}`}>{fmtPct(card.hitRate)}</div>
                  </div>
                </div>
                <div className={`mt-5 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#e8e8f8]'}`}>
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(18, Math.round(card.return * 200)))}%`,
                      background: isDark ? '#a5b4fc' : '#4f46e5',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-2xl border p-6 ${cardClass}`}>
              <div className={`text-xs uppercase tracking-widest ${textMuted}`}>Top Positions Today</div>
              <div className="mt-4 space-y-4">
                {todayLeaders.length ? (
                  todayLeaders.map((row) => (
                    <div key={row.label} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className={textSecondary}>{row.label}</span>
                        <span className={`font-mono ${row.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {fmtPct(row.value, true)}
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#e8e8f8]'}`}>
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.max(8, Math.round(Math.abs(row.value) * 1200)))}%`,
                            background: row.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`rounded-xl border p-4 text-sm ${isDark ? 'border-white/10 text-[#c4c4e8]' : 'border-[#e0e0f7] text-[#4a4a72]'}`}>
                    Waiting for model data to populate.
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-2xl border p-6 ${cardClass}`}>
              <div className={`text-xs uppercase tracking-widest ${textMuted}`}>Strategy Pulse</div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {todayTiles.map((tile) => (
                  <div key={tile.label} className={`rounded-xl border p-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-[#e0e0f7] bg-white/70'}`}>
                    <div className={`text-[11px] uppercase tracking-widest ${textMuted}`}>{tile.label}</div>
                    <div className={`mt-2 text-lg font-semibold ${textPrimary}`}>{tile.value}</div>
                    <div className={`text-xs mt-1 ${tile.tone === 'good' ? 'text-green-600' : tile.tone === 'bad' ? 'text-red-600' : textMuted}`}>
                      {tile.subLabel}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RETURN HEATMAP */}
      <section
        id="heatmap"
        className={`relative z-10 pb-24 ${isDark ? 'bg-[#11102a]/60' : 'bg-white/60'} backdrop-blur`}
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className={`rounded-3xl border p-6 md:p-8 ${cardClass}`}>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className={`text-xs uppercase tracking-widest ${textMuted}`}>Return Heat Map</div>
                <div className={`mt-2 font-serif text-2xl ${textPrimary}`}>
                  {heatmapModelName}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                <label className={`flex items-center gap-2 rounded-full border px-3 py-2 ${pillClass}`}>
                  <span className={textMuted}>Model</span>
                  <select
                    value={heatmapModel}
                    onChange={(event) => setHeatmapModel(event.target.value)}
                    className={`bg-transparent outline-none ${textPrimary}`}
                  >
                    {heatmapModelOptions.map((model: { id: string; name: string }) => (
                      <option key={model.id} value={model.id} className="text-black">
                        {model.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`flex items-center gap-2 rounded-full border px-3 py-2 ${pillClass}`}>
                  <span className={textMuted}>Month</span>
                  <select
                    value={heatmapMonth}
                    onChange={(event) => setHeatmapMonth(event.target.value)}
                    className={`bg-transparent outline-none ${textPrimary}`}
                  >
                    {heatmapMonths.map((month) => (
                      <option key={month} value={month} className="text-black">
                        {month}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={`flex items-center gap-2 rounded-full border px-3 py-2 ${pillClass}`}>
                  <span className={textMuted}>Year</span>
                  <select
                    value={heatmapYear}
                    onChange={(event) => setHeatmapYear(event.target.value)}
                    className={`bg-transparent outline-none ${textPrimary}`}
                  >
                    {heatmapYears.map((year) => (
                      <option key={year} value={year} className="text-black">
                        {year}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {filteredHeatmapDays.map((day) => (
                <div
                  key={day.dateKey}
                  className={`rounded-xl border px-3 py-4 text-center ${isDark ? 'border-white/10' : 'border-[#e0e0f7]'} ${heatClass(day.value, isDark)}`}
                >
                  <div className="text-[11px] uppercase tracking-widest opacity-70">{day.label}</div>
                  <div className="mt-2 text-sm font-semibold">{fmtPct(day.value, true)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 text-xs md:grid-cols-2">
              <div className="flex items-center justify-between">
                <div className={textMuted}>Start</div>
                <div className={textPrimary}>{filteredHeatmapDays[0]?.label ?? 'Pending'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={textMuted}>End</div>
                <div className={textPrimary}>{filteredHeatmapDays[filteredHeatmapDays.length - 1]?.label ?? 'Pending'}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={textMuted}>Min</div>
                <div className={textPrimary}>{fmtPct(heatStats.min ?? undefined, true)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={textMuted}>Max</div>
                <div className={textPrimary}>{fmtPct(heatStats.max ?? undefined, true)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={textMuted}>Average Session</div>
                <div className={textPrimary}>{fmtPct(heatStats.avg ?? undefined, true)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className={textMuted}>Positive Sessions</div>
                <div className={textPrimary}>{heatStats.positive}/{filteredHeatmapDays.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section
        id="pillars"
        ref={pillarsReveal.ref}
        className={`relative z-10 py-24 ${isDark ? 'bg-[#11102a]' : 'bg-white/40'} backdrop-blur ${pillarsReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className={`font-bold uppercase tracking-widest text-xs ${accentText}`}>Investment Framework</div>
            <h2 className={`font-serif text-3xl md:text-5xl ${textPrimary}`}>Our Investment Thesis</h2>
            <p className={`mt-2 ${textSecondary}`}>Four pillars that form the backbone of every capital allocation decision we make.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.number} className={`rounded-2xl p-8 shadow-sm hover:shadow-lg transition border ${cardClass}`}>
                <div className={`text-xs font-mono mb-3 ${accentText}`}>{pillar.number} —</div>
                <div className={`h-10 w-10 mb-3 rounded-xl border flex items-center justify-center ${isDark ? 'border-white/20 bg-white/10 text-[#a5b4fc]' : 'border-[#bdbdf7] bg-[#f4f4ff] text-[#4f46e5]'}`}>
                  <Icon name={pillar.icon} className="h-5 w-5" />
                </div>
                <div className={`font-serif text-xl mb-2 ${textPrimary}`}>{pillar.title}</div>
                <p className={`text-sm ${textSecondary}`}>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FRAMEWORK */}
      <section
        id="framework"
        ref={frameworkReveal.ref}
        className={`relative z-10 py-24 bg-transparent ${frameworkReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className={`font-bold uppercase tracking-widest text-xs mb-2 ${accentText}`}>How It Works</div>
          <h2 className={`font-serif text-3xl md:text-5xl mb-8 ${textPrimary}`}>Guided by Insight,<br />Driven by Discipline</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-2">
              {frameworkSteps.map((step, idx) => (
                <button
                  key={step.title}
                  className={`w-full text-left border-b py-4 transition ${isDark ? 'border-white/10' : 'border-[#e0e0f7]'} ${activeStep === idx ? 'text-[#4f46e5]' : isDark ? 'text-white' : 'text-[#1a1a2e]'}`}
                  onClick={() => setActiveStep(idx)}
                >
                  <div className="flex gap-4">
                    <div className={`font-mono text-xs ${textMuted}`}>{String(idx + 1).padStart(2, '0')}</div>
                    <div>
                      <div className={`font-semibold ${textPrimary}`}>{step.title}</div>
                      <div className={`text-sm mt-1 ${textSecondary}`}>{step.desc}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className={`rounded-2xl p-8 shadow-sm border ${cardClass}`}>
              <div className={`text-xs uppercase tracking-widest mb-4 ${textMuted}`}>Signal Strength</div>
              {activeStep === 0 && (
                <div className="space-y-3">
                  {[
                    { label: 'Momentum', val: 82 },
                    { label: 'Mean Reversion', val: 67 },
                    { label: 'Sentiment NLP', val: 74 },
                    { label: 'Macro', val: 55 },
                    { label: 'Alt Data', val: 91 },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <div className={`w-28 text-sm ${textSecondary}`}>{row.label}</div>
                      <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[#e8e8f8]'}`}>
                        <div className="h-2 bg-[#4f46e5]" style={{ width: `${row.val}%` }} />
                      </div>
                      <div className={`w-10 text-right text-xs font-mono ${accentText}`}>{row.val}</div>
                    </div>
                  ))}
                  <div className={`mt-4 rounded-lg border p-4 text-sm ${isDark ? 'border-white/20 bg-white/10 text-[#c4c4e8]' : 'border-[#bdbdf7] bg-[#f4f4ff] text-[#4a4a72]'}`}>
                    <div className={`text-xs font-bold mb-1 ${accentText}`}>BR-PPO DECISION</div>
                    Increase equity allocation by 12% — momentum and alt-data confluence at 91-score threshold.
                  </div>
                </div>
              )}
              {activeStep === 1 && (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-[#e0e0f7] pb-2"><span>Max Drawdown</span><span className="text-red-600">{fmtPct(maxDrawdown, true)}</span></div>
                  <div className="flex justify-between border-b border-[#e0e0f7] pb-2"><span>Volatility (ann.)</span><span className="text-[#d97706]">{fmtPct(stats?.volatility)}</span></div>
                  <div className="flex justify-between border-b border-[#e0e0f7] pb-2"><span>VaR (95%)</span><span className="text-green-600">{fmtPct(stats?.maxDrawdown)}</span></div>
                  <div className="flex justify-between"><span>Hit Rate</span><span className="text-green-600">{fmtPct(hitRate)}</span></div>
                </div>
              )}
              {activeStep === 2 && (
                <div className="space-y-3 text-sm">
                  {benchmarkBars.slice(0, 4).map((row) => (
                    <div key={row.name} className="flex justify-between border-b border-[#e0e0f7] pb-2">
                      <span>{row.name}</span>
                      <span className="text-[#4f46e5]">{fmtPct(row.value, true)}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeStep === 3 && (
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-[#e8e8f8] p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-green-600 font-semibold">BUY · HDFC Bank</span><span className="text-[#8888aa]">09:32:14</span></div>
                    150 qty @ 1642.50 — Momentum 88/100, Allocation +2.1%
                  </div>
                  <div className="rounded-lg bg-[#e8e8f8] p-3">
                    <div className="flex justify-between text-xs mb-1"><span className="text-red-600 font-semibold">SELL · Wipro</span><span className="text-[#8888aa]">10:15:08</span></div>
                    300 qty @ 458.20 — Stop-loss triggered at −4% drawdown limit
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* PERFORMANCE */}
      <section
        id="performance"
        ref={performanceReveal.ref}
        className={`relative z-10 py-24 ${isDark ? 'bg-[#0f0d22] text-white' : 'bg-[#13112a] text-white'} ${performanceReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-[#a5b4fc] font-bold uppercase tracking-widest text-xs">Track Record</div>
          <h2 className="font-serif text-3xl md:text-5xl mt-2">Numbers that speak<br />for themselves</h2>
          <p className="text-[#8888aa] mt-3 max-w-xl">Verified performance metrics across all live strategies, audited quarterly by independent custodians.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-[#8888aa]">Annualised Return</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(annualizedReturn)}</div>
              <div className="text-sm text-green-300 mt-2">Above benchmark spread</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-[#8888aa]">Sharpe Ratio</div>
              <div className="font-serif text-4xl mt-2">{fmtNum(sharpe, 2)}</div>
              <div className="text-sm text-green-300 mt-2">Risk-adjusted outperformance</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-[#8888aa]">Win Rate</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(hitRate)}</div>
              <div className="text-sm text-[#8888aa] mt-2">Across live trades</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-xs uppercase tracking-widest text-[#8888aa]">Max Drawdown</div>
              <div className="font-serif text-4xl mt-2">{fmtPct(maxDrawdown, true)}</div>
              <div className="text-sm text-[#8888aa] mt-2">Worst peak-to-trough</div>
            </div>
          </div>
          <div className="mt-10">
            <div className="text-xs uppercase tracking-widest text-[#8888aa] mb-4">Returns vs Benchmarks</div>
            <div className="space-y-4">
              {benchmarkBars.map((row) => (
                <div key={row.name}>
                  <div className="flex justify-between text-sm text-[#cbd5f5] mb-1">
                    <span>{row.name}</span>
                    <span>{fmtPct(row.value, true)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/15">
                    <div className="h-2 rounded-full" style={{ width: `${row.width}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* APPROACH */}
      <section
        id="approach"
        ref={approachReveal.ref}
        className={`relative z-10 py-24 bg-transparent ${approachReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-5xl px-6">
          <div className={`font-bold uppercase tracking-widest text-xs ${accentText}`}>Methodology</div>
          <h2 className={`font-serif text-3xl md:text-5xl mt-2 ${textPrimary}`}>Guided by Insight,<br />Built on Science</h2>
          <p className={`mt-2 max-w-xl ${textSecondary}`}>A multi-disciplinary framework that bridges human intuition and machine intelligence.</p>
          <div className="grid md:grid-cols-2 gap-6 mt-10">
            {approachCards.map((card) => (
              <div key={card.title} className={`rounded-2xl p-6 flex gap-4 border ${cardClass}`}>
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${isDark ? 'border-white/20 bg-white/10 text-[#a5b4fc]' : 'border-[#bdbdf7] bg-[#f4f4ff] text-[#4f46e5]'}`}>
                  <Icon name={card.icon} className="h-5 w-5" />
                </div>
                <div>
                  <div className={`font-semibold ${textPrimary}`}>{card.title}</div>
                  <p className={`text-sm mt-1 ${textSecondary}`}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ctaReveal.ref}
        className={`relative z-10 py-24 text-center ${isDark ? 'bg-[#11102a]' : 'bg-gradient-to-br from-[#eeeeff] via-[#f4f4f9] to-[#ece9fe]'} ${ctaReveal.visible ? 'reveal-visible' : ''}`}
        data-reveal
      >
        <div className="mx-auto max-w-3xl px-6">
          <div className={`font-bold uppercase tracking-widest text-xs ${accentText}`}>Get Started</div>
          <h2 className={`font-serif text-3xl md:text-5xl mt-2 ${textPrimary}`}>Start investing with<br />an intelligent edge</h2>
          <p className={`mt-3 ${textSecondary}`}>Join investors who trust Qsentia's reinforcement learning platform. Institutional-grade tools, consumer-grade clarity.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8">
            <Link href="/dashboard" className="px-8 py-3 rounded-lg bg-[#4f46e5] text-white font-semibold shadow hover:bg-[#4338ca] transition">View Live Research Terminal</Link>
            <a href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request" className={`px-8 py-3 rounded-lg border font-semibold transition ${isDark ? 'border-white/30 text-white bg-white/10 hover:bg-white/20' : 'border-[#4f46e5] text-[#4f46e5] bg-white/80 hover:bg-[#f4f4f9]'}`}>Request Information</a>
          </div>
          <div className={`text-xs mt-4 ${textMuted}`}>No spam, no pressure.</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#0f0d22] text-white">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid md:grid-cols-4 gap-8 border-b border-white/10 pb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo/qsentia-primary.png"
                  alt="QSentia Logo"
                  width={200}
                  height={60}
                  className="h-12 w-auto"
                />
                <span className="text-sm font-semibold tracking-widest text-white">Qsentia</span>
              </div>
              <p className="text-sm text-[#6666aa]">Intelligent reinforcement learning for quantitative finance. Where machine precision meets market perception.</p>
              <p className="text-xs text-[#5555aa] mt-4">© 2026 QSentia. All rights reserved.</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#6666aa]">
                <Link href="/privacy" className="hover:text-[#a5b4fc]">Privacy Policy</Link>
                <span className="text-[#44446a]">|</span>
                <Link href="/disclaimer" className="hover:text-[#a5b4fc]">Disclaimer</Link>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white mb-3">Product</div>
              <a href="#strategy" className="block text-sm text-[#6666aa] mb-2 hover:text-[#a5b4fc]">Research Terminal</a>
              <a href="#pillars" className="block text-sm text-[#6666aa] mb-2 hover:text-[#a5b4fc]">Investment Thesis</a>
              <a href="#performance" className="block text-sm text-[#6666aa] mb-2 hover:text-[#a5b4fc]">Performance</a>
              <a href="#approach" className="block text-sm text-[#6666aa] hover:text-[#a5b4fc]">Methodology</a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-white mb-3">Legal</div>
              <Link href="/privacy" className="block text-sm text-[#6666aa] mb-2 hover:text-[#a5b4fc]">Privacy Policy</Link>
              <Link href="/disclaimer" className="block text-sm text-[#6666aa] mb-2 hover:text-[#a5b4fc]">Disclaimer</Link>
            </div>
          </div>
          <div className="text-xs text-[#44446a] flex flex-col md:flex-row justify-between items-start md:items-center pt-6">
            <span>Investments in securities are subject to market risk. Past performance is not indicative of future results.</span>
            <div className="flex gap-4 mt-3 md:mt-0">
              <a href="#" className="hover:text-[#a5b4fc]">Privacy</a>
              <a href="#" className="hover:text-[#a5b4fc]">Terms</a>
              <a href="mailto:Lucas.Zarzeczny@qsentia.com" className="hover:text-[#a5b4fc]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function useCountUp(target: number, start: boolean, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setValue(Math.round(target * progress));

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [duration, start, target]);

  return value;
}

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
