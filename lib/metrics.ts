export type PerfStats = {
  totalReturn: number | null;
  annualizedReturn: number | null;
  sharpe: number | null;
  sortino: number | null;
  calmar: number | null;
  maxDrawdown: number | null;
  volatility: number | null;
  hitRate: number | null;
  nObservations: number;
  nReturns: number;
  status: 'ready' | 'partial' | 'insufficient';
};

const MIN_RETURNS_FOR_RISK_METRICS = 5;

export function pctChange(values: number[]) {
  const out: number[] = [];

  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1];
    const cur = values[i];

    if (prev && Number.isFinite(prev) && Number.isFinite(cur)) {
      out.push(cur / prev - 1);
    }
  }

  return out;
}

export function normalizeTo100(values: number[]) {
  if (!values.length || !values[0]) return [];
  const first = values[0];
  return values.map((v) => (v / first) * 100);
}

export function computeStats(values: number[]): PerfStats {
  const clean = values.filter((v) => Number.isFinite(v));

  if (clean.length < 2) {
    return emptyStats(clean.length, 0, 'insufficient');
  }

  const returns = pctChange(clean);
  const totalReturn = clean[clean.length - 1] / clean[0] - 1;
  const maxDrawdown = computeMaxDrawdown(clean);

  if (returns.length < MIN_RETURNS_FOR_RISK_METRICS) {
    return {
      totalReturn,
      annualizedReturn: null,
      sharpe: null,
      sortino: null,
      calmar: null,
      maxDrawdown,
      volatility: null,
      hitRate: returns.length ? returns.filter((r) => r > 0).length / returns.length : null,
      nObservations: clean.length,
      nReturns: returns.length,
      status: 'partial',
    };
  }

  const mean = average(returns);
  const std = sampleStd(returns);
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideStd = sampleStd(downsideReturns);

  const annualizedReturn = Math.pow(clean[clean.length - 1] / clean[0], 252 / returns.length) - 1;
  const volatility = std * Math.sqrt(252);
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : null;
  const sortino = downsideStd > 0 ? (mean / downsideStd) * Math.sqrt(252) : null;
  const calmar =
    maxDrawdown !== null && maxDrawdown < 0
      ? annualizedReturn / Math.abs(maxDrawdown)
      : null;
  const hitRate = returns.filter((r) => r > 0).length / returns.length;

  return {
    totalReturn,
    annualizedReturn,
    sharpe,
    sortino,
    calmar,
    maxDrawdown,
    volatility,
    hitRate,
    nObservations: clean.length,
    nReturns: returns.length,
    status: returns.length >= 20 ? 'ready' : 'partial',
  };
}

function computeMaxDrawdown(values: number[]) {
  if (!values.length) return null;

  let peak = values[0];
  let maxDrawdown = 0;

  for (const v of values) {
    peak = Math.max(peak, v);
    const dd = peak ? v / peak - 1 : 0;
    maxDrawdown = Math.min(maxDrawdown, dd);
  }

  return maxDrawdown;
}

function emptyStats(
  nObservations: number,
  nReturns: number,
  status: 'ready' | 'partial' | 'insufficient'
): PerfStats {
  return {
    totalReturn: null,
    annualizedReturn: null,
    sharpe: null,
    sortino: null,
    calmar: null,
    maxDrawdown: null,
    volatility: null,
    hitRate: null,
    nObservations,
    nReturns,
    status,
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function sampleStd(values: number[]) {
  if (values.length < 2) return 0;
  const avg = average(values);
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) /
    Math.max(values.length - 1, 1);
  return Math.sqrt(variance);
}

export function fmtDollar(value: number | null | undefined) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Pending';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  });
}

export function fmtPct(value: number | null | undefined, signed = false) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Pending';
  const sign = signed && value >= 0 ? '+' : '';
  return `${sign}${(value * 100).toFixed(2)}%`;
}

export function fmtNum(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return 'Pending';
  return value.toFixed(digits);
}
