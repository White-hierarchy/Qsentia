'use client';

import useSWR from 'swr';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import QSentiaMotionBackground from '@/components/QSentiaMotionBackground';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { computeStats, fmtDollar, fmtNum, fmtPct } from '@/lib/metrics';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const DEFAULT_ACCOUNT_MODEL_ID = 'real_crypto_carry_ibkr';

function getHighestSharpeModelId(modelComparison: any[]) {
  const candidates = (modelComparison || [])
    .filter((m: any) => {
      const sharpe = Number(m?.stats?.sharpe);
      const nReturns = Number(m?.stats?.nReturns ?? 0);

      return m?.id && Number.isFinite(sharpe) && nReturns > 0;
    })
    .sort((a: any, b: any) => Number(b?.stats?.sharpe) - Number(a?.stats?.sharpe));

  return candidates[0]?.id || null;
}

function dailyFundReturnRows(modelComparison: any[]) {
  return (modelComparison || []).map((model: any) => {
    const points = model?.points || [];
    const latest = points[points.length - 1];
    const previous = points[points.length - 2];

    const latestValue = Number(model?.latestValue);
    const latestIndex = Number(latest?.value);
    const previousIndex = Number(previous?.value);

    const dayReturn =
      Number.isFinite(latestIndex) && Number.isFinite(previousIndex) && previousIndex !== 0
        ? latestIndex / previousIndex - 1
        : null;

    return {
      id: model.id,
      name: model.name || model.id,
      color: model.color || '#4b3fd1',
      latestDate: latest?.timestamp || 'Pending',
      latestValue: Number.isFinite(latestValue) ? latestValue : null,
      dayReturn,
      hasData: dayReturn !== null,
    };
  });
}

function sortPoints(points: any[]) {
  return [...(points || [])]
    .filter((p: any) => p?.timestamp && Number.isFinite(Number(p?.value)))
    .sort((a: any, b: any) => String(a.timestamp).localeCompare(String(b.timestamp)));
}

function ytdFundReturnRows(modelComparison: any[]) {
  const allPoints = (modelComparison || []).flatMap((model: any) => sortPoints(model?.points || []));
  const latestTimestamp =
    allPoints.length > 0 ? allPoints[allPoints.length - 1]?.timestamp : new Date().toISOString().slice(0, 10);

  const currentYear = String(latestTimestamp || new Date().toISOString()).slice(0, 4);
  const ytdStart = `${currentYear}-01-01`;

  return (modelComparison || []).map((model: any) => {
    const points = sortPoints(model?.points || []);
    const ytdPoints = points.filter((point: any) => String(point.timestamp) >= ytdStart);

    const first = ytdPoints[0];
    const latest = ytdPoints[ytdPoints.length - 1];

    const firstIndex = Number(first?.value);
    const latestIndex = Number(latest?.value);
    const latestValue = Number(model?.latestValue);

    const ytdReturn =
      Number.isFinite(firstIndex) && Number.isFinite(latestIndex) && firstIndex !== 0
        ? latestIndex / firstIndex - 1
        : null;

    return {
      id: model.id,
      name: model.name || model.id,
      color: model.color || '#4b3fd1',
      ytdStart: first?.timestamp || 'Pending',
      latestDate: latest?.timestamp || 'Pending',
      latestValue: Number.isFinite(latestValue) ? latestValue : null,
      ytdReturn,
      hasData: ytdReturn !== null,
    };
  });
}

function pctFromPoints(points: any[]) {
  const clean = sortPoints(points);
  if (clean.length < 2) return null;

  const first = Number(clean[0].value);
  const last = Number(clean[clean.length - 1].value);

  if (!Number.isFinite(first) || !Number.isFinite(last) || first === 0) return null;

  return last / first - 1;
}

function benchmarkReturn(model: any, ticker: string) {
  const benchmark = (model?.benchmarks || []).find((b: any) => b?.ticker === ticker);
  const direct = Number(benchmark?.stats?.totalReturn);

  if (Number.isFinite(direct)) return direct;

  return pctFromPoints(benchmark?.points || []);
}

function sinceOwnInceptionLeaderboardRows(data: any) {
  const rows = (data?.modelComparison || []).map((model: any) => {
    const points = sortPoints(model?.points || []);
    const totalReturn = Number(model?.stats?.totalReturn);
    const spyReturn = benchmarkReturn(model, 'SPY');
    const qqqReturn = benchmarkReturn(model, 'QQQ');
    const vtiReturn = benchmarkReturn(model, 'VTI');

    const excessVsSpy =
      Number.isFinite(totalReturn) && spyReturn !== null ? totalReturn - spyReturn : null;

    const nReturns = Number(model?.stats?.nReturns ?? 0);
    const nObservations = Number(model?.stats?.nObservations ?? points.length ?? 0);

    return {
      _rankValue: excessVsSpy ?? totalReturn ?? -Infinity,
      _rankable: nReturns >= 3,
      Model: model?.name || model?.id,
      'Inception Date': model?.inceptionDate || points[0]?.timestamp || 'Pending',
      'Live Observations': nObservations,
      'Total Return': fmtPct(Number.isFinite(totalReturn) ? totalReturn : null, true),
      'SPY Same Window': fmtPct(spyReturn, true),
      'QQQ Same Window': fmtPct(qqqReturn, true),
      'VTI Same Window': fmtPct(vtiReturn, true),
      'Excess vs SPY': fmtPct(excessVsSpy, true),
      Sharpe: fmtNum(model?.stats?.sharpe),
      'Max Drawdown': fmtPct(model?.stats?.maxDrawdown, true),
      Status:
        nReturns >= 20
          ? 'Rankable'
          : nReturns >= 3
            ? 'Early live history'
            : 'Insufficient live history',
    };
  });

  return rows
    .sort((a: any, b: any) => {
      if (a._rankable !== b._rankable) return a._rankable ? -1 : 1;
      return Number(b._rankValue) - Number(a._rankValue);
    })
    .map(({ _rankValue, _rankable, ...row }: any, index: number) => ({
      Rank: index + 1,
      ...row,
    }));
}

function commonWindowLeaderboardRows(data: any) {
  const models = (data?.modelComparison || [])
    .map((model: any) => ({
      ...model,
      cleanPoints: sortPoints(model?.points || []),
    }))
    .filter((model: any) => model.cleanPoints.length >= 2);

  if (models.length < 2) return [];

  const commonStart = models
    .map((model: any) => model.cleanPoints[0].timestamp)
    .sort()
    .at(-1);

  const commonEnd = models
    .map((model: any) => model.cleanPoints[model.cleanPoints.length - 1].timestamp)
    .sort()[0];

  if (!commonStart || !commonEnd || commonStart > commonEnd) return [];

  const spyPoints = sortPoints(
    (data?.benchmarks || []).find((b: any) => b?.ticker === 'SPY')?.points || []
  ).filter((p: any) => p.timestamp >= commonStart && p.timestamp <= commonEnd);

  const spyCommonReturn = pctFromPoints(spyPoints);

  const rows = models.map((model: any) => {
    const windowPoints = model.cleanPoints.filter(
      (p: any) => p.timestamp >= commonStart && p.timestamp <= commonEnd
    );

    const values = windowPoints.map((p: any) => Number(p.value));
    const stats = computeStats(values);
    const commonReturn = pctFromPoints(windowPoints);

    const excessVsSpy =
      commonReturn !== null && spyCommonReturn !== null
        ? commonReturn - spyCommonReturn
        : null;

    const observations = windowPoints.length;
    const nReturns = Math.max(0, observations - 1);

    return {
      _rankValue: excessVsSpy ?? commonReturn ?? -Infinity,
      _rankable: nReturns >= 3,
      Model: model?.name || model?.id,
      'Common Start': commonStart,
      'Common End': commonEnd,
      'Common Observations': observations,
      'Common Return': fmtPct(commonReturn, true),
      'SPY Common Return': fmtPct(spyCommonReturn, true),
      'Excess vs SPY': fmtPct(excessVsSpy, true),
      'Common Sharpe': fmtNum(stats?.sharpe),
      'Common Max Drawdown': fmtPct(stats?.maxDrawdown, true),
      Status:
        nReturns >= 20
          ? 'Rankable'
          : nReturns >= 3
            ? 'Early common history'
            : 'Too little common history',
    };
  });

  return rows
    .sort((a: any, b: any) => {
      if (a._rankable !== b._rankable) return a._rankable ? -1 : 1;
      return Number(b._rankValue) - Number(a._rankValue);
    })
    .map(({ _rankValue, _rankable, ...row }: any, index: number) => ({
      Rank: index + 1,
      ...row,
    }));
}

export default function DashboardPage() {
  const [model, setModel] = useState<string | null>(null);
  const [selectedFundDetail, setSelectedFundDetail] = useState<any>(null);

  const { data, error, isLoading } = useSWR(
    `/api/dashboard${model ? `?model=${model}` : ''}`,
    fetcher,
    { refreshInterval: 120000 }
  );

  const bestSharpeModelId = useMemo(() => {
    return getHighestSharpeModelId(data?.modelComparison || []);
  }, [data?.modelComparison]);

  useEffect(() => {
    if (model) return;

    if (data?.registry?.some((m: any) => m.id === DEFAULT_ACCOUNT_MODEL_ID)) {
      setModel(DEFAULT_ACCOUNT_MODEL_ID);
      return;
    }

    if (data?.selectedModel) {
      setModel(data.selectedModel);
      return;
    }

    if (bestSharpeModelId) {
      setModel(bestSharpeModelId);
    }
  }, [bestSharpeModelId, data?.registry, data?.selectedModel, model]);

  if (isLoading) return <LoadingScreen text="Loading live QSentia research terminal..." />;
  if (error) return <LoadingScreen text="Unable to load GitHub trading logs." />;

  const stats = data?.stats || {};
  const latestDecision = data?.latest?.decision || {};
  const latestPortfolioValue = data?.latest?.portfolioValue;
  const firstPortfolioValue = data?.latest?.firstPortfolioValue;

  const pnl =
    data?.latest?.portfolioPnl ??
    (latestPortfolioValue !== null && latestPortfolioValue !== undefined && firstPortfolioValue
      ? latestPortfolioValue - firstPortfolioValue
      : null);
  const totalReturn = data?.latest?.portfolioReturn ?? stats.totalReturn;
  
  const selectedModelName =
    data?.registry?.find((m: any) => m.id === data?.selectedModel)?.name ||
    data?.selectedModel ||
    'Selected Strategy';

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />
      
      <FundDetailModal fund={selectedFundDetail} onClose={() => setSelectedFundDetail(null)} />

      <div className="relative z-10 mx-auto max-w-[1620px] px-6 py-12">
          <TopNav />
        
          <DailyFundReturnBanner
            data={data}
            selectedModelId={data?.selectedModel}
            onSelectModel={setModel}
            onFundSelect={setSelectedFundDetail}
          />

          <YtdFundReturnBanner
              data={data}
              selectedModelId={data?.selectedModel}
              onSelectModel={setModel}
              onFundSelect={setSelectedFundDetail}
            />
        
          <section className="mb-12 grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-[#4b3fd1]/15 bg-white/72 p-8 shadow-[0_20px_80px_rgba(75,63,209,0.08)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_30px_100px_rgba(75,63,209,0.12)]">  
            <CornerMarks />
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#4b3fd1]/10 blur-3xl" />
            <div className="absolute -bottom-24 left-16 h-64 w-64 rounded-full bg-black/5 blur-3xl" />

            <div className="relative mb-6 flex flex-col items-center justify-center gap-2">
              <QLogo />
              <div className="text-xs font-black uppercase tracking-[0.20em] text-[#4b3fd1]">
                Live Terminal
              </div>
            </div>

            <div className="relative mb-3 text-xs font-black uppercase tracking-[0.24em] text-[#4b3fd1]/70">
              Institutional Research Program
            </div>

            <h1 className="relative max-w-2xl text-5xl font-light leading-[1.1] tracking-[-0.08em] text-black max-xl:text-4xl max-md:text-3xl">
              More Alpha<br />Less Risk<br />Live.
            </h1>

            <p className="relative mt-5 max-w-xl text-sm leading-7 text-neutral-600">
              BR-PPO paper trading with live portfolio monitoring, risk control, and execution transparency.
            </p>

            <div className="relative mt-6 flex flex-wrap gap-2">
              <Pill>GitHub Logs</Pill>
              <Pill>Alpaca Paper Trading</Pill>
              <Pill>BR-PPO</Pill>
              <Pill>Auto Refresh 120s</Pill>
              <Pill>{selectedModelName}</Pill>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <MetricTile
              label="Net Liquidation"
              value={fmtDollar(latestPortfolioValue)}
              detail="Latest IBKR/account value observation"
              large
            />
            <MetricTile label="Total P&L" value={fmtDollar(pnl)} detail="Paper trading basis" large />
            <MetricTile
              label="Total Return"
              value={fmtPct(totalReturn, true)}
              detail={historyStatus(stats)}
            />
            <MetricTile
              label="Sharpe"
              value={fmtNum(stats.sharpe)}
              detail={stats?.status === 'partial' ? 'Pending more return observations' : 'Annualized'}
            />
            <MetricTile label="Max Drawdown" value={fmtPct(stats.maxDrawdown, true)} detail="Peak to trough" />
            <MetricTile
              label="Current Signal"
              value={latestDecision?.action || 'Pending'}
              detail="Latest model allocation"
            />
          </div>
        </section>

        <section className="mb-12 rounded-[28px] border border-[#4b3fd1]/25 bg-gradient-to-br from-[#4b3fd1] to-[#372db8] p-8 text-white shadow-[0_30px_100px_rgba(75,63,209,0.25)] transition-all duration-300 hover:shadow-[0_40px_120px_rgba(75,63,209,0.35)]">
          <div className="text-xs font-black uppercase tracking-[0.20em] text-white/60 mb-4">
            Research Framework
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.5fr]">
            <h2 className="text-4xl font-light leading-[1.15] tracking-[-0.06em]">
              Adaptive allocation with benchmark discipline.
            </h2>
            <p className="text-sm leading-6 text-white/75">
              Live signal quality, transparent execution, and risk-first portfolio construction.
            </p>
          </div>
        </section>

        <section className="mb-12 grid gap-4 md:grid-cols-4">
          <ThesisCard
            number="01"
            title="Adaptive Allocation"
            text="BR-PPO and alpha models update exposure from live state, target weights, risk behavior, and execution constraints."
          />
          <ThesisCard
            number="02"
            title="Benchmark Discipline"
            text="Each model is normalized and compared through a single relative performance framework."
          />
          <ThesisCard
            number="03"
            title="Risk First"
            text="Drawdown, return quality, volatility, and model health are surfaced before allocation decisions."
          />
          <ThesisCard
            number="04"
            title="Execution Traceability"
            text="Positions, target weights, planned orders, submitted orders, and decisions remain visible from GitHub logs."
          />
        </section>

        <section className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-black/8 bg-white/70 p-5 shadow-[0_12px_40px_rgba(25,20,90,0.06)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_18px_50px_rgba(25,20,90,0.1)]">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.24em] text-neutral-500">
              Strategy Selection
            </div>
            <select
              className="mt-2 min-w-[360px] rounded-[12px] border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black outline-none transition focus:border-[#4b3fd1] focus:shadow-[0_0_0_3px_rgba(75,63,209,0.1)]"
              value={model || data?.selectedModel || ''}
              onChange={(e) => setModel(e.target.value)}
            >
              {(data?.registry || []).map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name || m.id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatusBadge
              label={latestDecision?.account_status === 'connected' ? 'Live Paper' : 'Research Mode'}
            />
            <StatusBadge label={`Models: ${data?.registry?.length || 0}`} muted />
            <StatusBadge label={`Last Run: ${data?.latest?.lastRun || 'No data'}`} muted />
          </div>
        </section>

        <Tabs
          tabs={[
            'Model Comparison',
            'Executive Overview',
            'Performance Analytics',
            'Portfolio Exposure',
            'Execution Monitor',
            'Decision History',
            'Model Health',
          ]}
          panels={[
            <ModelComparison key="compare" data={data} />,
            <ExecutiveOverview key="overview" data={data} />,
            <PerformanceAnalytics key="perf" data={data} />,
            <PortfolioExposure key="portfolio" data={data} />,
            <ExecutionMonitor key="orders" data={data} />,
            <DecisionHistory key="history" data={data} />,
            <ModelHealth key="health" data={data} />,
          ]}
        />

        <footer className="mt-16 border-t border-black/6 pt-12 pb-8">
          <div className="grid gap-8 mb-8 md:grid-cols-3">
            <div>
              <div className="mb-3">
                <Image
                  src="/logo/Qsentia Logo Bg transparent.png"
                  alt="QSentia Logo"
                  width={320}
                  height={100}
                  className="h-auto w-auto max-h-[130px] max-w-[320px] object-contain"
                />
              </div>
              <p className="text-xs leading-5 text-neutral-500 max-w-xs">
                Institutional research terminal for adaptive allocation, benchmark discipline, and execution transparency.
              </p>
            </div>
            <div>
              <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-600">Resources</div>
              <ul className="space-y-2 text-xs text-neutral-500">
                <li><a href="/dashboard" className="hover:text-[#4b3fd1] transition">Live Dashboard</a></li>
                <li><a href="/" className="hover:text-[#4b3fd1] transition">Home</a></li>
                <li><a href="mailto:Lucas.Zarzeczny@qsentia.com" className="hover:text-[#4b3fd1] transition">Contact</a></li>
              </ul>
            </div>
            <div className="text-right">
              <div className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-neutral-600">Status</div>
              <div className="space-y-2 text-xs">
                <div><span className="text-neutral-500">Paper Trading:</span> <span className="font-bold text-[#4b3fd1]">Live</span></div>
                <div><span className="text-neutral-500">Last Updated:</span> <span className="font-bold text-black">{data?.updatedAt || '—'}</span></div>
                <div className="text-[10px] text-neutral-400 mt-3">Auto-refresh every 120s</div>
              </div>
            </div>
          </div>
          <div className="border-t border-black/6 pt-6 text-xs text-neutral-400 text-center">
            Q-Sentia Research Terminal · Live paper trading intelligence · Not investment advice · © 2026
          </div>
        </footer>
      </div>
    </main>
  );
}

function TopNav() {
  return (
    <header className="mb-12 flex items-center justify-between rounded-[24px] border border-black/8 bg-white/70 px-8 py-5 shadow-[0_12px_40px_rgba(25,20,90,0.06)] backdrop-blur-md transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 group">
        <Image
          src="/logo/Qsentia Logo Bg transparent.png"
          alt="QSentia Logo"
          width={320}
          height={105}
          className="h-auto w-auto max-h-[120px] max-w-[320px] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.18em] text-neutral-600 md:flex">
        <a href="/dashboard" className="px-4 py-2 rounded-[12px] text-[#4b3fd1] transition hover:bg-[#4b3fd1]/10">
          Terminal
        </a>

        <a
          href="mailto:Lucas.Zarzeczny@qsentia.com?subject=QSentia Investor Information Request"
          className="border border-[#4b3fd1]/30 bg-[#4b3fd1]/10 px-5 py-2.5 text-[#4b3fd1] rounded-[12px] transition duration-300 hover:bg-[#4b3fd1]/20 hover:border-[#4b3fd1]/50"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

function FundDetailModal({ fund, onClose }: { fund: any | null; onClose: () => void }) {
  const [timePeriod, setTimePeriod] = useState('1Y');

  if (!fund) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl rounded-[32px] border border-black/8 bg-white/95 shadow-[0_30px_120px_rgba(75,63,209,0.2)] backdrop-blur-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 hover:bg-white transition-colors"
          aria-label="Close detail view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="border-b border-black/8 px-8 py-6">
          <div className="flex items-start gap-4 mb-4">
            <div
              className="h-12 w-12 rounded-full flex-shrink-0"
              style={{
                backgroundColor: fund.color || '#4b3fd1',
                opacity: 0.2,
              }}
            />
            <div className="flex-1">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-[#4b3fd1]/60 mb-1">
                {fund.id}
              </div>
              <h2 className="text-3xl font-light tracking-[-0.06em] text-black mb-2">{fund.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-light text-black">{fmtDollar(fund.latestValue)}</span>
                <span
                  className={`text-sm font-bold ${
                    Number(fund.dayReturn) > 0 ? 'text-emerald-600' : Number(fund.dayReturn) < 0 ? 'text-red-600' : 'text-neutral-600'
                  }`}
                >
                  {fund.dayReturn !== null ? `${fmtPct(fund.dayReturn, true)} 1D` : 'Pending'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 hover:bg-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 hover:bg-white transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="px-8 py-8">
          <div className="h-[500px] rounded-[16px] border border-black/6 bg-[#fbfbfb]/80 p-4">
            <div className="h-full w-full flex items-center justify-center text-sm text-neutral-500">
              {/* Placeholder - in real implementation, would render actual chart */}
              Chart for {fund.name} ({timePeriod} period)
            </div>
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="border-t border-black/8 px-8 py-6 flex items-center justify-center gap-3 flex-wrap">
          {['1D', '1W', '1M', '3M', '6M', '1Y', '3Y', 'All'].map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                timePeriod === period
                  ? 'bg-[#4b3fd1] text-white border border-[#4b3fd1]'
                  : 'border border-black/15 text-neutral-600 hover:border-[#4b3fd1]/30 hover:text-[#4b3fd1]'
              }`}
            >
              {period}
            </button>
          ))}
          <button className="px-4 py-2 rounded-full text-sm font-bold border border-black/15 text-neutral-600 hover:border-[#4b3fd1]/30 hover:text-[#4b3fd1] transition-all">
            Terminal
          </button>
        </div>
      </div>
    </div>
  );
}

function ScrollButtons({
  scrollContainerRef,
  rowId,
}: {
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  rowId: string;
}) {
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const atStart = scrollLeft === 0;
    const atEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 1;

    setShowLeft(!atStart);
    setShowRight(!atEnd);

    // Update mask classes
    const scrollContainer = container.closest('.scroll-container') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.classList.remove('at-start', 'at-end', 'at-both');
      if (atStart && atEnd) {
        scrollContainer.classList.add('at-both');
      } else if (atStart) {
        scrollContainer.classList.add('at-start');
      } else if (atEnd) {
        scrollContainer.classList.add('at-end');
      }
    }
  }, [scrollContainerRef]);

  const handleScroll = useCallback(
    (direction: 'left' | 'right') => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const scrollAmount = 260;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });

      setHasInteracted(true);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }

      // Re-check after scroll settles
      setTimeout(checkScroll, 400);
    },
    [scrollContainerRef, checkScroll]
  );

  const startAutoScroll = useCallback(() => {
    if (hasInteracted) return;

    const container = scrollContainerRef.current;
    if (!container || autoScrollIntervalRef.current) return;

    const scrollParent = container.closest('.scroll-container') as HTMLElement;
    if (scrollParent) {
      scrollParent.classList.add('with-hint');
    }

    autoScrollIntervalRef.current = setInterval(() => {
      if (container.scrollLeft < container.scrollWidth - container.clientWidth) {
        container.scrollLeft += 1;
      }
    }, 30);
  }, [hasInteracted, scrollContainerRef]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }

    const container = scrollContainerRef.current;
    if (container) {
      const scrollParent = container.closest('.scroll-container') as HTMLElement;
      if (scrollParent) {
        scrollParent.classList.remove('with-hint');
      }
    }
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Initial check
    checkScroll();

    // Add scroll listener
    container.addEventListener('scroll', checkScroll);

    // Add interaction listeners - stops animation permanently
    const onInteract = () => {
      setHasInteracted(true);
      stopAutoScroll();
    };

    // Stop animation when cursor enters (to allow reading)
    const onMouseEnter = () => {
      stopAutoScroll();
    };

    // Resume animation when cursor leaves (if not interacted)
    const onMouseLeave = () => {
      if (!hasInteracted) {
        startAutoScroll();
      }
    };

    container.addEventListener('mouseenter', onMouseEnter);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('touchstart', onInteract);
    container.addEventListener('wheel', onInteract);
    container.addEventListener('click', onInteract);

    // Start auto-scroll hint on mount
    const timer = setTimeout(() => {
      if (!hasInteracted) startAutoScroll();
    }, 500);

    return () => {
      container.removeEventListener('scroll', checkScroll);
      container.removeEventListener('mouseenter', onMouseEnter);
      container.removeEventListener('mouseleave', onMouseLeave);
      container.removeEventListener('touchstart', onInteract);
      container.removeEventListener('wheel', onInteract);
      container.removeEventListener('click', onInteract);
      clearTimeout(timer);
      stopAutoScroll();
    };
  }, [scrollContainerRef, checkScroll, hasInteracted, startAutoScroll, stopAutoScroll]);

  return (
    <>
      <button
        className={`scroll-button left ${showLeft ? 'visible' : ''}`}
        onClick={() => handleScroll('left')}
        aria-label="Scroll left"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        className={`scroll-button right ${showRight ? 'visible' : ''}`}
        onClick={() => handleScroll('right')}
        aria-label="Scroll right"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </>
  );
}

function DailyFundReturnBanner({
  data,
  selectedModelId,
  onSelectModel,
  onFundSelect,
}: {
  data: any;
  selectedModelId?: string | null;
  onSelectModel: (id: string) => void;
  onFundSelect?: (fund: any) => void;
}) {
  const rows = useMemo(() => {
    return dailyFundReturnRows(data?.modelComparison || []);
  }, [data?.modelComparison]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!rows.length) return null;

  const best = rows
    .filter((row: any) => row.dayReturn !== null)
    .sort((a: any, b: any) => Number(b.dayReturn) - Number(a.dayReturn))[0];

  const worst = rows
    .filter((row: any) => row.dayReturn !== null)
    .sort((a: any, b: any) => Number(a.dayReturn) - Number(b.dayReturn))[0];

  return (
    <section className="mb-8 overflow-hidden rounded-[24px] border border-black/8 bg-white/75 shadow-[0_18px_60px_rgba(25,20,90,0.08)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-6 py-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
            Daily Fund Performance
          </div>
          <div className="mt-1 text-sm font-medium text-neutral-600">
            Latest one-day gain/loss from committed portfolio logs
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {best && (
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-700">
              Best Today: {best.name} {fmtPct(best.dayReturn, true)}
            </div>
          )}
          {worst && (
            <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 font-bold text-red-700">
              Weakest Today: {worst.name} {fmtPct(worst.dayReturn, true)}
            </div>
          )}
        </div>
      </div>

      <div className="scroll-container scroll-masked relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 py-4"
        >
          {rows.map((row: any) => {
            const positive = Number(row.dayReturn) > 0;
            const negative = Number(row.dayReturn) < 0;
            const active = row.id === selectedModelId;

            return (
              <button
                key={row.id}
                onClick={() => {
                  onSelectModel(row.id);
                  onFundSelect?.(row);
                }}
                className={`min-w-[245px] rounded-[18px] border px-4 py-4 text-left transition hover:-translate-y-0.5 ${
                  active
                    ? 'border-[#4b3fd1] bg-[#4b3fd1]/10 shadow-[0_16px_40px_rgba(75,63,209,0.16)]'
                    : 'border-black/8 bg-white/70 hover:border-[#4b3fd1]/30'
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <div className="truncate text-xs font-black uppercase tracking-[0.12em] text-neutral-600">
                    {row.name}
                  </div>
                </div>

                <div
                  className={`text-3xl font-light tracking-[-0.06em] ${
                    positive
                      ? 'text-emerald-600'
                      : negative
                        ? 'text-red-600'
                        : 'text-neutral-700'
                  }`}
                >
                  {row.hasData ? fmtPct(row.dayReturn, true) : 'Pending'}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
                  <span>{row.latestDate}</span>
                  <span>{row.latestValue ? fmtDollar(row.latestValue) : 'No value'}</span>
                </div>
              </button>
            );
          })}
        </div>
        <ScrollButtons scrollContainerRef={scrollContainerRef} rowId="daily" />
      </div>
    </section>
  );
}

function YtdFundReturnBanner({
  data,
  selectedModelId,
  onSelectModel,
  onFundSelect,
}: {
  data: any;
  selectedModelId?: string | null;
  onSelectModel: (id: string) => void;
  onFundSelect?: (fund: any) => void;
}) {
  const rows = useMemo(() => {
    return ytdFundReturnRows(data?.modelComparison || []);
  }, [data?.modelComparison]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!rows.length) return null;

  const best = rows
    .filter((row: any) => row.ytdReturn !== null)
    .sort((a: any, b: any) => Number(b.ytdReturn) - Number(a.ytdReturn))[0];

  const worst = rows
    .filter((row: any) => row.ytdReturn !== null)
    .sort((a: any, b: any) => Number(a.ytdReturn) - Number(b.ytdReturn))[0];

  return (
    <section className="mb-8 overflow-hidden rounded-[24px] border border-black/8 bg-white/75 shadow-[0_18px_60px_rgba(25,20,90,0.08)] backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 px-6 py-4">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
            YTD Fund Return
          </div>
          <div className="mt-1 text-sm font-medium text-neutral-600">
            Calendar year return from each fund’s first available live observation this year
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {best && (
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-700">
              Best YTD: {best.name} {fmtPct(best.ytdReturn, true)}
            </div>
          )}
          {worst && (
            <div className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 font-bold text-red-700">
              Weakest YTD: {worst.name} {fmtPct(worst.ytdReturn, true)}
            </div>
          )}
        </div>
      </div>

      <div className="scroll-container scroll-masked relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto px-4 py-4"
        >
          {rows.map((row: any) => {
            const positive = Number(row.ytdReturn) > 0;
            const negative = Number(row.ytdReturn) < 0;
            const active = row.id === selectedModelId;

            return (
              <button
                key={row.id}
                onClick={() => {
                  onSelectModel(row.id);
                  onFundSelect?.(row);
                }}
                className={`min-w-[245px] rounded-[18px] border px-4 py-4 text-left transition hover:-translate-y-0.5 ${
                  active
                    ? 'border-[#4b3fd1] bg-[#4b3fd1]/10 shadow-[0_16px_40px_rgba(75,63,209,0.16)]'
                    : 'border-black/8 bg-white/70 hover:border-[#4b3fd1]/30'
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  <div className="truncate text-xs font-black uppercase tracking-[0.12em] text-neutral-600">
                    {row.name}
                  </div>
                </div>

                <div
                  className={`text-3xl font-light tracking-[-0.06em] ${
                    positive
                      ? 'text-emerald-600'
                      : negative
                        ? 'text-red-600'
                        : 'text-neutral-700'
                  }`}
                >
                  {row.hasData ? fmtPct(row.ytdReturn, true) : 'Pending'}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-neutral-500">
                  <span>From {row.ytdStart}</span>
                  <span>{row.latestValue ? fmtDollar(row.latestValue) : 'No value'}</span>
                </div>
              </button>
            );
          })}
        </div>
        <ScrollButtons scrollContainerRef={scrollContainerRef} rowId="ytd" />
      </div>
    </section>
  );
}

function ModelComparison({ data }: { data: any }) {
  const chartData = useMemo(() => {
    const strategySeries =
      (data?.modelComparison || []).map((m: any) => ({
        key: m.name,
        points: m.points || [],
      })) || [];

    const benchmarkSeries =
      (data?.benchmarks || []).map((b: any) => ({
        key: `${b.name} (${b.ticker})`,
        points: b.points || [],
      })) || [];

    return mergeSeries([...strategySeries, ...benchmarkSeries]);
  }, [data]);

  const hasBenchmarkData = (data?.benchmarks || []).some((b: any) => b.points?.length);

  const commonWindowRows = useMemo(() => {
    return commonWindowLeaderboardRows(data);
  }, [data]);

  const ownInceptionRows = useMemo(() => {
    return sinceOwnInceptionLeaderboardRows(data);
  }, [data]);

  return (
    <Panel
      eyebrow="Institutional Benchmark Discipline"
      title="Model Comparison"
      subtitle="Compare live model portfolio performance against institutional benchmarks. Solid lines represent live model portfolios normalized to 100. Dashed lines represent SPY, QQQ, DIA, IWM, and VTI benchmarks—all measured from BR-PPO V10 original inception."
    >
      <ChartFrame title="Normalized Equity Curves">
        {/* Benchmark Legend */}
        {(data?.benchmarks || []).length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3 rounded-lg bg-neutral-50 p-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 bg-neutral-500" />
              <span className="font-bold text-neutral-600">Strategy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-0.5 w-6 border-t-2 border-dashed border-neutral-400" />
              <span className="font-bold text-neutral-600">Benchmark</span>
            </div>
            <div className="ml-auto text-neutral-500">
              Reference line at 100: baseline performance
            </div>
          </div>
        )}

        <div className="h-[900px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 16, right: 40, bottom: 16, left: 60 }}>
              <CartesianGrid stroke="rgba(75,63,209,0.08)" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                stroke="#999"
                tick={{ fontSize: 12, fill: '#666', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                minTickGap={40}
                label={{ value: 'Date', position: 'insideBottomRight', offset: -10, fill: '#999', fontSize: 11 }}
              />
              <YAxis
                stroke="#999"
                tick={{ fontSize: 12, fill: '#666', fontWeight: 500 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                domain={['auto', 'auto']}
                label={{ value: 'Performance (Base 100)', angle: -90, position: 'insideLeft', fill: '#999', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  ...tooltipStyle,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(75,63,209,0.2)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  boxShadow: '0 12px 40px rgba(75,63,209,0.15)',
                }}
                labelStyle={{ color: '#333', fontWeight: 600, fontSize: 13 }}
                formatter={(value: any) => [typeof value === 'number' ? value.toFixed(2) : value, '']}
              />
              <Legend
                wrapperStyle={{
                  fontSize: 12,
                  fontWeight: 600,
                  paddingTop: '20px',
                  paddingBottom: '12px',
                }}
                verticalAlign="bottom"
                height={36}
              />
              <ReferenceLine
                y={100}
                stroke="rgba(0,0,0,0.25)"
                strokeDasharray="6 4"
                label={{ value: 'Baseline (100)', position: 'right', fill: '#666', fontSize: 11, offset: 10 }}
              />

              {(data?.modelComparison || []).map((m: any) => (
                <Line
                  key={m.name}
                  type="monotone"
                  dataKey={m.name}
                  stroke={m.color || '#4b3fd1'}
                  strokeWidth={m.id === data?.selectedModel ? 3.5 : 2.5}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                  activeDot={{ r: 6, fill: 'white', stroke: m.color, strokeWidth: 2.5 }}
                />
              ))}

              {(data?.benchmarks || []).map((b: any) => (
                <Line
                  key={`${b.name} (${b.ticker})`}
                  type="monotone"
                  dataKey={`${b.name} (${b.ticker})`}
                  stroke={b.color || '#a0a0a0'}
                  strokeWidth={2.0}
                  strokeDasharray="10 5"
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                  activeDot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {!hasBenchmarkData && (
          <div className="mt-6 rounded-2xl border border-[#4b3fd1]/20 bg-[#4b3fd1]/8 p-5 text-sm leading-6 text-[#4b3fd1]">
            <div className="font-bold mb-1">📊 Benchmark data pending</div>
            <div className="text-neutral-600">
              Benchmark overlay is ready in the chart layer, but benchmark data has not been returned by the API yet. 
              Check <code className="text-xs bg-white/50 px-2 py-0.5 rounded">/api/dashboard</code> for the <code className="text-xs bg-white/50 px-2 py-0.5 rounded">benchmarks</code> field.
            </div>
          </div>
        )}
      </ChartFrame>

      <DataTable
        title="Common Window Leaderboard — Apples-to-Apples Model Ranking"
        rows={commonWindowRows}
      />

      <DataTable
        title="Best Model Since Own Inception — Benchmark Matched"
        rows={ownInceptionRows}
      />

      <DataTable
        title="Relative Performance Table"
        rows={relativePerformanceRows(data)}
      />
    </Panel>
  );
}

function ExecutiveOverview({ data }: { data: any }) {
  const latestDecision = data?.latest?.decision || {};

  return (
    <Panel
      eyebrow="Command Center"
      title="Executive Overview"
      subtitle="Current model state, portfolio trajectory, latest signal, account state, and live operating posture."
    >
      <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <ChartFrame title="Net Liquidation Value">
          <div className="h-[600px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.equityCurve || []} margin={{ top: 16, right: 40, bottom: 16, left: 60 }}>
                <defs>
                  <linearGradient id="portfolioFillLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4b3fd1" stopOpacity={0.32} />
                    <stop offset="58%" stopColor="#4b3fd1" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#4b3fd1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(75,63,209,0.08)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#999"
                  tick={{ fontSize: 11, fill: '#666', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                />
                <YAxis
                  stroke="#999"
                  tick={{ fontSize: 11, fill: '#666', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                  label={{ value: 'Net Liquidation ($)', angle: -90, position: 'insideLeft', fill: '#999', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    ...tooltipStyle,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(75,63,209,0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 12px 40px rgba(75,63,209,0.15)',
                  }}
                  formatter={(value: any) => [value ? fmtDollar(value) : 'N/A', 'Net Liquidation']}
                />
                <Area
                  type="monotone"
                  dataKey="portfolioValue"
                  stroke="#4b3fd1"
                  strokeWidth={3}
                  fill="url(#portfolioFillLight)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <div className="rounded-[34px] border border-black/10 bg-white/82 p-7 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-[#4b3fd1]">
            Operating State
          </div>
          <h3 className="mb-6 text-4xl font-light tracking-[-0.07em]">Live Status</h3>
          <InfoRow label="Account Status" value={latestDecision.account_status || 'Pending'} />
          <InfoRow label="Submit Orders" value={String(latestDecision.submit_orders ?? 'Pending')} />
          <InfoRow label="Current Signal" value={latestDecision.action || 'Pending'} />
          <InfoRow label="Last Run" value={data?.latest?.lastRun || 'Pending'} />
          <InfoRow label="Health" value={data?.healthStatus?.overall_status || 'Pending'} />
          <InfoRow label="Observations" value={String(data?.stats?.nObservations ?? 'Pending')} />
          <InfoRow label="Return Points" value={String(data?.stats?.nReturns ?? 'Pending')} />
        </div>
      </div>
    </Panel>
  );
}

function PerformanceAnalytics({ data }: { data: any }) {
  return (
    <Panel
      eyebrow="Risk Intelligence"
      title="Performance Analytics"
      subtitle="Return quality, drawdown behavior, volatility, hit rate, and risk adjusted performance."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-5">
        <MetricTile label="Total Return" value={fmtPct(data?.stats?.totalReturn, true)} detail={historyStatus(data?.stats)} />
        <MetricTile label="Annual Return" value={fmtPct(data?.stats?.annualizedReturn, true)} detail="Annualized if enough history" />
        <MetricTile label="Volatility" value={fmtPct(data?.stats?.volatility)} detail="Annualized volatility" />
        <MetricTile label="Hit Rate" value={fmtPct(data?.stats?.hitRate)} detail="Positive periods" />
        <MetricTile label="Calmar" value={fmtNum(data?.stats?.calmar)} detail="Return / drawdown" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartFrame title="Drawdown Profile">
          <div className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.drawdowns || []} margin={{ top: 16, right: 40, bottom: 16, left: 60 }}>
                <CartesianGrid stroke="rgba(75,63,209,0.08)" vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#999"
                  tick={{ fontSize: 11, fill: '#666', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                />
                <YAxis
                  stroke="#999"
                  tick={{ fontSize: 11, fill: '#666', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
                  label={{ value: 'Drawdown (%)', angle: -90, position: 'insideLeft', fill: '#999', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    ...tooltipStyle,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    border: '1px solid rgba(220,38,38,0.2)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    boxShadow: '0 12px 40px rgba(220,38,38,0.1)',
                  }}
                  formatter={(value: any) => [typeof value === 'number' ? (value * 100).toFixed(2) + '%' : 'N/A', 'Drawdown']}
                />
                <ReferenceLine
                  y={0}
                  stroke="rgba(0,0,0,0.25)"
                  strokeDasharray="6 4"
                  label={{ value: 'Zero Line', position: 'right', fill: '#666', fontSize: 11, offset: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="drawdown"
                  stroke="#dc2626"
                  strokeWidth={2.5}
                  fill="#ef4444"
                  fillOpacity={0.15}
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>

        <ChartFrame title="Return Series">
          <div className="h-[460px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.returns || []}>
                <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#737373" tick={{ fontSize: 11, fill: '#525252' }} />
                <YAxis stroke="#737373" tick={{ fontSize: 12, fill: '#525252' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <ReferenceLine y={0} stroke="rgba(0,0,0,0.22)" strokeDasharray="4 4" />
                <Bar dataKey="return" fill="#4b3fd1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartFrame>
      </div>
    </Panel>
  );
}

function PortfolioExposure({ data }: { data: any }) {
  return (
    <Panel eyebrow="Portfolio Construction" title="Portfolio Exposure" subtitle="Current holdings, target weights, and historical target allocations produced by the model.">
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable title="Current Positions" rows={data?.positions || []} />
        <DataTable title="Latest Target Weights" rows={data?.targetWeights || []} />
      </div>
      <div className="mt-6">
        <DataTable title="Target Weight History" rows={data?.targetWeightHistory || []} />
      </div>
    </Panel>
  );
}

function ExecutionMonitor({ data }: { data: any }) {
  return (
    <Panel eyebrow="Execution Intelligence" title="Execution Monitor" subtitle="Planned orders, submitted orders, and full execution history from the paper trading workflow.">
      <div className="grid gap-6 lg:grid-cols-2">
        <DataTable title="Latest Planned Orders" rows={data?.plannedOrders || []} />
        <DataTable title="Latest Submitted Orders" rows={data?.submittedOrders || []} />
      </div>
      <div className="mt-6">
        <DataTable title="Submitted Orders History" rows={data?.ordersHistory || []} />
      </div>
    </Panel>
  );
}

function DecisionHistory({ data }: { data: any }) {
  const actionCounts = data?.actionCounts || [];
  const hasActionCounts = actionCounts.length > 0;

  return (
    <Panel
      eyebrow="Model Intent"
      title="Decision History"
      subtitle="Historical allocation decisions, model signals, and action frequency from the committed decision logs."
    >
      <div className="grid gap-6">
        <DataTable title="Decision Log" rows={data?.decisions || []} />

        <ChartFrame title="Action Frequency">
          {!hasActionCounts ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-black/10 bg-white/70 p-8 text-center">
              <div>
                <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#4b3fd1]">
                  Pending Signal History
                </div>
                <p className="max-w-xl text-sm leading-6 text-neutral-600">
                  No action-frequency data is available yet. This chart will populate once the
                  decision log includes model actions, signals, or decision labels.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={actionCounts} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
                  <CartesianGrid stroke="rgba(75,63,209,0.10)" vertical={false} />
                  <XAxis
                    dataKey="action"
                    stroke="#737373"
                    tick={{ fontSize: 11, fill: '#525252' }}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(0,0,0,0.15)' }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#737373"
                    tick={{ fontSize: 12, fill: '#525252' }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#4b3fd1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartFrame>
      </div>
    </Panel>
  );
}

function ModelHealth({ data }: { data: any }) {
  return (
    <Panel eyebrow="Operational Trust" title="Model Health" subtitle="Central health monitor outputs, signal history, data diagnostics, and live model diagnostics.">
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricTile label="Health Status" value={data?.healthStatus?.overall_status || 'Pending'} detail="Current monitor state" />
        <MetricTile label="Decision Count" value={String(data?.healthStatus?.n_decisions ?? 'Pending')} detail="Logged decisions" />
        <MetricTile label="Signal Rows" value={String(data?.signalHistory?.length || 0)} detail="Health observations" />
        <MetricTile label="Portfolio Rows" value={String(data?.equityCurve?.length || 0)} detail="Equity records" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[34px] border border-black/10 bg-white/82 p-6 shadow-[0_28px_100px_rgba(25,20,90,0.12)] backdrop-blur-2xl">
          <div className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-[#4b3fd1]">
            Health Status JSON
          </div>
          <pre className="max-h-[520px] overflow-auto rounded-2xl border border-black/10 bg-[#fbfbfb] p-4 text-xs text-neutral-700">
            {JSON.stringify(data?.healthStatus || {}, null, 2)}
          </pre>
        </div>
        <DataTable title="Signal History" rows={data?.signalHistory || []} />
      </div>

      <div className="mt-6">
        <DataTable
          title="Data Diagnostics"
          rows={[
            {
              selectedModel: data?.debug?.selectedModel,
              registryCount: data?.debug?.registryCount,
              models: data?.debug?.registry?.map((m: any) => m.id).join(', '),
              portfolioRows: data?.debug?.rowCounts?.portfolioRows,
              decisionsRows: data?.debug?.rowCounts?.decisionsRows,
              positionsRows: data?.debug?.rowCounts?.positionsRows,
              ordersRows: data?.debug?.rowCounts?.ordersHistoryRows,
              signalRows: data?.debug?.rowCounts?.signalHistoryRows,
            },
          ]}
        />
      </div>
    </Panel>
  );
}

function Tabs({ tabs, panels }: { tabs: string[]; panels: React.ReactNode[] }) {
  const [active, setActive] = useState(0);

  return (
    <section>
      <div className="mb-6 flex flex-nowrap items-center gap-0 overflow-x-auto border-b border-[#6e6ec8]/20 bg-[#eeeef6]/80 px-8">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`whitespace-nowrap border-b-2 bg-transparent px-[16px] flex items-center h-[38px] text-[11px] font-sans tracking-[0.2px] transition-all duration-150 ${
              active === i
                ? 'border-[#4f46e5] font-semibold text-[#4f46e5]'
                : 'border-transparent font-medium text-[#9090b8] hover:text-[#4a4a72]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      {panels[active]}
    </section>
  );
}

function Panel({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[14px] border border-[#6e6ec8]/20 bg-white/60 p-6 mb-4 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="relative mb-6">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[1.5px] text-[#4f46e5]">{eyebrow}</div>
        <h2 className="mb-2 text-[2rem] font-serif font-normal tracking-tight text-[#1a1a2e] leading-[1.1]">{title}</h2>
        <p className="max-w-[700px] text-[12px] font-light leading-[1.6] text-[#4a4a72]">{subtitle}</p>
      </div>
      <div className="relative space-y-4">{children}</div>
    </section>
  );
}

function ChartFrame({ title, children, description }: { title: string; children: React.ReactNode; description?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#6e6ec8]/20 bg-white/85 mb-4 shadow-sm backdrop-blur-md">
      <div className="border-b border-[#6e6ec8]/15 px-4 py-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-[3px] text-[10px] font-bold uppercase tracking-[1px] text-[#9090b8]">Chart Analysis</div>
          <h3 className="text-[13px] font-medium text-[#1a1a2e]">{title}</h3>
          {description && <p className="mt-1 text-[11px] text-neutral-500">{description}</p>}
        </div>
        <div className="h-5 w-5 border border-[#6e6ec8]/20 rounded flex items-center justify-center text-[10px] text-[#9090b8]" />
      </div>
      <div className="relative p-3 bg-white/50">{children}</div>
    </div>
  );
}

function MetricTile({ label, value, detail, large = false }: { label: string; value: string; detail: string; large?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#6e6ec8]/20 bg-white/85 p-4 shadow-sm backdrop-blur-md">
      <div className="mb-[6px] text-[10px] font-bold uppercase tracking-[0.6px] text-[#9090b8]">{label}</div>
      <div className={`font-mono font-bold tracking-tight text-[#1a1a2e] ${large ? 'text-[2rem] leading-none' : 'text-[1.65rem] leading-none'}`}>
        {value}
      </div>
      <div className="mt-1 text-[10px] text-[#9090b8]">{detail}</div>
      <div className="absolute top-[10px] right-[10px] flex h-5 w-5 items-center justify-center rounded border border-[#6e6ec8]/20 text-[10px] text-[#9090b8]"></div>
    </div>
  );
}

function DataTable({ title, rows }: { title: string; rows: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // ADDED: State for pagination limited to Relative Performance Table
  const [visibleCount, setVisibleCount] = useState(10);
  const isRelativePerformanceTable = title === 'Relative Performance Table';

  // ADDED: Reset pagination when sorting or search filtering changes
  useEffect(() => {
    if (isRelativePerformanceTable) {
      setVisibleCount(10);
    }
  }, [searchTerm, sortColumn, sortDirection, isRelativePerformanceTable]);

  const columns = useMemo(() => {
    const safeRows = Array.isArray(rows) ? rows : [];
    const columnSet = new Set<string>();

    for (const row of safeRows) {
      if (!row || typeof row !== 'object') continue;

      Object.keys(row).forEach((key) => {
        columnSet.add(key);
      });
    }

    return Array.from(columnSet);
  }, [rows]);

  const safeRows = Array.isArray(rows) ? rows : [];

  const filteredAndSorted = useMemo(() => {
    let filtered = safeRows.filter(row => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(searchLower)
      );
    });

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a?.[sortColumn];
        const bVal = b?.[sortColumn];
        const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [safeRows, searchTerm, sortColumn, sortDirection]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#6e6ec8]/20 bg-white/85 shadow-sm backdrop-blur-md mb-4">
      <div className="border-b border-[#6e6ec8]/15 px-4 py-3">
        <div className="flex items-center justify-between gap-4 mb-2">
          <div>
            <div className="mb-[2px] text-[10px] font-bold uppercase tracking-[1px] text-[#9090b8]">
              Data
            </div>
            <h3 className="text-[13px] font-medium text-[#1a1a2e]">
              {title}
            </h3>
          </div>

          <div className="shrink-0 rounded-[4px] border border-[#6e6ec8]/20 bg-white/80 px-2 py-[2px] text-[10px] font-semibold text-[#4a4a72]">
            {/* CHANGED: Reflect actual visible rows dynamically if paginated */}
            {isRelativePerformanceTable
              ? `${Math.min(visibleCount, filteredAndSorted.length)} / ${filteredAndSorted.length}`
              : `${filteredAndSorted.length} / ${safeRows.length}`}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search models, assets, or values..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-none border-b border-[#6e6ec8]/15 bg-transparent px-2.5 py-[7px] text-[11px] font-sans text-[#1a1a2e] placeholder-[#9090b8] outline-none transition focus:border-[#4f46e5]"
        />
      </div>

      {!safeRows.length || !columns.length ? (
        <div className="p-6 text-center text-[12px] text-[#9090b8]">
          No data yet.
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div className="p-6 text-center text-[12px] text-[#9090b8]">
          No results for "{searchTerm}"
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto overflow-y-hidden">
          <table className="w-full min-w-max border-collapse border-spacing-0 text-left text-[11px]">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column}
                    onClick={() => handleSort(column)}
                    className={`sticky top-0 z-20 border-b border-[#6e6ec8]/20 bg-white/60 px-[10px] py-[8px] text-[10px] font-bold uppercase tracking-[0.6px] text-[#9090b8] cursor-pointer transition hover:bg-white/80 ${
                      index === 0 ? 'left-0 z-30 min-w-[200px]' : 'min-w-[160px]'
                    } ${
                      sortColumn === column ? 'text-[#4f46e5]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{prettyColumnName(column)}</span>
                      {sortColumn === column && (
                        <span className="ml-[2px] text-[8px]">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredAndSorted
                /* CHANGED: Slice array based on visible component state if it's the target table */
                .slice(0, isRelativePerformanceTable ? visibleCount : undefined)
                .map((row, rowIndex) => (
                <tr key={rowIndex} className="group hover:bg-[#4f46e5]/[0.09]">
                  {columns.map((column, columnIndex) => {
                    const value = formatTableCell(row?.[column]);

                    return (
                      <td
                        key={`${rowIndex}-${column}`}
                        className={`border-b border-[#6e6ec8]/15 px-[10px] py-[8px] align-middle text-[#1a1a2e] text-[11px] transition-colors duration-200 ${
                          columnIndex === 0
                            ? 'sticky left-0 z-10 min-w-[200px] bg-white group-hover:bg-[#f6f6fc]'
                            : 'min-w-[160px]'
                        }`}
                        title={value}
                      >
                        <div className="max-w-[300px] whitespace-normal break-words leading-[1.4]">
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {safeRows.length > 0 && columns.length > 6 && (
        <div className="border-t border-[#6e6ec8]/15 bg-white/40 px-[10px] py-[6px] text-[10px] font-medium text-[#9090b8]">
          Scroll to view all columns
        </div>
      )}

      {/* ADDED: "Read More" Pagination logic exclusively for the Relative Performance Table */}
      {isRelativePerformanceTable && filteredAndSorted.length > 10 && (
        <div className="flex justify-center border-t border-[#6e6ec8]/15 bg-white/40 px-5 py-3">
          {visibleCount < filteredAndSorted.length ? (
            <button
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="rounded-[4px] border border-[#6e6ec8]/20 bg-white/80 px-[14px] py-[6px] text-[11px] font-bold text-[#4a4a72] transition hover:bg-white focus:outline-none"
            >
              Read More
            </button>
          ) : (
            <button
              disabled
              className="cursor-not-allowed rounded-[4px] border border-transparent bg-transparent px-[14px] py-[6px] text-[11px] font-bold text-[#9090b8]"
            >
              All entries shown
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ThesisCard({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="relative overflow-hidden rounded-[20px] border border-black/8 bg-white/70 p-5 shadow-[0_12px_40px_rgba(25,20,90,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_60px_rgba(75,63,209,0.12)]">
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#4b3fd1]/6 blur-2xl" />
      <div className="relative mb-6 text-xs font-black tracking-[0.20em] text-[#4b3fd1]/70">{number}</div>
      <h3 className="relative mb-3 text-lg font-light tracking-[-0.05em] text-black">{title}</h3>
      <p className="relative text-xs leading-5 text-neutral-500">{text}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-4">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">{label}</div>
      <div className="max-w-[55%] text-right text-sm font-bold text-black">{value}</div>
    </div>
  );
}

function StatusBadge({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div
      className={`rounded-[12px] border px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
        muted
          ? 'border-black/8 bg-white/60 text-neutral-500 hover:bg-white/80'
          : 'border-[#4b3fd1]/30 bg-[#4b3fd1]/20 text-[#4b3fd1] shadow-[0_8px_20px_rgba(75,63,209,0.15)] hover:shadow-[0_12px_30px_rgba(75,63,209,0.25)]'
      }`}
    >
      {label}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-black/8 bg-white/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 backdrop-blur-md transition-all duration-200 hover:bg-white/80 hover:text-neutral-700">
      {children}
    </span>
  );
}

function QLogo() {
  return (
    <Image
      src="/logo/Qsentia Logo Bg transparent.png"
      alt="QSentia Logo"
      width={480}
      height={160}
      className="h-auto w-auto max-h-[180px] max-w-[480px] object-contain"
    />
  );
}

function CornerMarks() {
  return (
    <>
      <div className="absolute left-4 top-4 h-4 w-4 border-l border-t border-[#4b3fd1]/20" />
      <div className="absolute right-4 top-4 h-4 w-4 border-r border-t border-[#4b3fd1]/20" />
      <div className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-[#4b3fd1]/20" />
      <div className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-[#4b3fd1]/20" />
    </>
  );
}

function LoadingScreen({ text }: { text: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfbfb] text-black">
      <QSentiaMotionBackground />
      <div className="relative z-10 rounded-[40px] border border-[#4b3fd1]/20 bg-white/82 p-10 text-center shadow-[0_36px_130px_rgba(25,20,90,0.14)] backdrop-blur-2xl">
        <div className="mx-auto mb-6 flex justify-center">
          <Image
            src="/logo/Qsentia Logo Bg transparent.png"
            alt="QSentia Logo"
            width={480}
            height={160}
            className="h-auto w-auto max-h-[180px] max-w-[480px] object-contain"
          />
        </div>
        <div className="text-sm font-black uppercase tracking-[0.22em] text-[#4b3fd1]">{text}</div>
      </div>
    </main>
  );
}

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(0,0,0,0.10)',
  borderRadius: '12px',
  color: '#1a1a1a',
  boxShadow: '0 16px 60px rgba(25,20,90,0.15)',
  padding: '10px 12px',
  fontSize: '12px',
  fontWeight: 600,
};

function mergeSeries(series: { key: string; points: { timestamp: string; value: number }[] }[]) {
  const byTimestamp: Record<string, any> = {};

  for (const s of series) {
    for (const point of s.points || []) {
      const t = point.timestamp;
      if (!byTimestamp[t]) byTimestamp[t] = { timestamp: t };
      byTimestamp[t][s.key] = point.value;
    }
  }

  return Object.values(byTimestamp).sort(
    (a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

function fmtBenchmarkLatestValue(benchmark: any) {
  const points = benchmark?.points || [];
  const lastPoint = points.length ? points[points.length - 1] : null;
  const value = lastPoint?.value;

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'Pending';
  }

  return `Index = ${value.toFixed(2)}`;
}

function formatInceptionDate(timestamp: string | undefined) {
  if (!timestamp) return 'Pending';

  const normalized = String(timestamp)
    .trim()
    .replace('_', 'T');

  let date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    const dateOnly = String(timestamp).slice(0, 10);
    date = new Date(`${dateOnly}T00:00:00Z`);
  }

  if (Number.isNaN(date.getTime())) return 'Pending';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function getBestPerformingModel(models: any[]) {
  const ranked = (models || [])
    .filter((m: any) => typeof m?.stats?.totalReturn === 'number' && Number.isFinite(m.stats.totalReturn))
    .sort((a: any, b: any) => b.stats.totalReturn - a.stats.totalReturn);

  return ranked.length ? ranked[0] : null;
}

function bestModelVsBenchmarkRows(data: any, bestModel: any) {
  if (!bestModel) {
    return [
      {
        Asset: 'Pending',
        Type: 'Best QSentia Model',
        'Total Return': 'Pending',
        Sharpe: 'Pending',
        'Max Drawdown': 'Pending',
        'Vs Best Benchmark': 'Pending',
      },
    ];
  }

  const benchmarks = bestModel?.benchmarks || [];

  const benchmarkRows = benchmarks.map((b: any) => ({
    Asset: `${b.name} (${b.ticker})`,
    Type: 'Benchmark',
    'Total Return': fmtPct(b.stats?.totalReturn, true),
    Sharpe: fmtNum(b.stats?.sharpe),
    'Max Drawdown': fmtPct(b.stats?.maxDrawdown, true),
    'Return Gap vs Best Model': compareReturnGap(bestModel.stats?.totalReturn, b.stats?.totalReturn),
  }));

  const bestBenchmark = benchmarks
    .filter((b: any) => typeof b?.stats?.totalReturn === 'number' && Number.isFinite(b.stats.totalReturn))
    .sort((a: any, b: any) => b.stats.totalReturn - a.stats.totalReturn)[0];

  return [
    {
      Asset: bestModel.name,
      Type: 'Best QSentia Model',
      'Total Return': fmtPct(bestModel.stats?.totalReturn, true),
      Sharpe: fmtNum(bestModel.stats?.sharpe),
      'Max Drawdown': fmtPct(bestModel.stats?.maxDrawdown, true),
      'Return Gap vs Best Benchmark': bestBenchmark
        ? compareReturnGap(bestModel.stats?.totalReturn, bestBenchmark.stats?.totalReturn)
        : 'Pending',
    },
    ...benchmarkRows,
  ];
}

function compareReturnGap(modelReturn: number | null | undefined, benchmarkReturn: number | null | undefined) {
  if (
    typeof modelReturn !== 'number' ||
    typeof benchmarkReturn !== 'number' ||
    !Number.isFinite(modelReturn) ||
    !Number.isFinite(benchmarkReturn)
  ) {
    return 'Pending';
  }

  const gap = modelReturn - benchmarkReturn;
  return fmtPct(gap, true);
}

function relativePerformanceRows(data: any) {
  const rows: Record<string, any>[] = [];

  for (const model of data?.modelComparison || []) {
    const inceptionDate = model.inceptionDate || model.points?.[0]?.timestamp;

    rows.push({
      Asset: model.name,
      Type: 'QSentia Model',
      'Inception Date': formatInceptionDate(inceptionDate),
      Status: statsStatus(model.stats),
      'Latest Value': fmtDollar(model.latestValue),
      'Total Return': fmtPct(model.stats?.totalReturn, true),
      Sharpe: fmtNum(model.stats?.sharpe),
      'Max Drawdown': fmtPct(model.stats?.maxDrawdown, true),
      Volatility: fmtPct(model.stats?.volatility),
    });

    for (const benchmark of model.benchmarks || []) {
      rows.push({
        Asset: `↳ ${benchmark.name} (${benchmark.ticker})`,
        Type: `Benchmark vs ${model.name}`,
        'Inception Date': formatInceptionDate(inceptionDate),
        Status: statsStatus(benchmark.stats),
        'Latest Value': fmtBenchmarkLatestValue(benchmark),
        'Total Return': fmtPct(benchmark.stats?.totalReturn, true),
        Sharpe: fmtNum(benchmark.stats?.sharpe),
        'Max Drawdown': fmtPct(benchmark.stats?.maxDrawdown, true),
        Volatility: fmtPct(benchmark.stats?.volatility),
      });
    }
  }

  return rows;
}

function statsStatus(stats: any) {
  if (!stats) return 'Pending';

  if (stats.status === 'partial') {
    return `Partial history (${stats.nObservations || 0} observations)`;
  }

  if (stats.status === 'insufficient') {
    return 'Insufficient history';
  }

  return 'Ready';
}

function prettyColumnName(column: string) {
  return String(column)
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTableCell(value: any) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '—';
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function historyStatus(stats: any) {
  if (!stats) return 'Pending data';
  if (stats.status === 'partial') {
    return `Partial history: ${stats.nObservations || 0} observations`;
  }
  if (stats.status === 'insufficient') {
    return 'Insufficient history';
  }
  return `${stats.nObservations || 0} observations`;
}
