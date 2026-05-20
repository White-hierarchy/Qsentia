import { NextResponse } from 'next/server';
import { computeStats, normalizeTo100, pctChange } from '@/lib/metrics';
import Papa from 'papaparse';

export const dynamic = 'force-dynamic';

const REGISTRY_OWNER = process.env.NEXT_PUBLIC_QSENTIA_REPO_OWNER || 'FinTechEntrepreneurldz';
const REGISTRY_REPO = process.env.NEXT_PUBLIC_QSENTIA_REPO_NAME || 'Base_Model_BR_PPO';
const REGISTRY_BRANCH = process.env.NEXT_PUBLIC_QSENTIA_BRANCH || 'main';
const DEFAULT_MODEL_ID = process.env.NEXT_PUBLIC_QSENTIA_DEFAULT_MODEL_ID || 'real_crypto_carry_ibkr';
const ACCOUNT_BASELINE_MODEL_IDS = new Set(['real_crypto_carry_ibkr']);
const DEFAULT_ACCOUNT_STARTING_CAPITAL = Number(
  process.env.QSENTIA_ACCOUNT_STARTING_CAPITAL ||
    process.env.NEXT_PUBLIC_QSENTIA_ACCOUNT_STARTING_CAPITAL ||
    1000000
);

const BENCHMARKS = [
  { name: 'S&P 500', ticker: 'SPY', color: '#111111' },
  { name: 'Nasdaq 100', ticker: 'QQQ', color: '#7c3aed' },
  { name: 'Dow Jones', ticker: 'DIA', color: '#737373' },
  { name: 'Russell 2000', ticker: 'IWM', color: '#b45309' },
  { name: 'Total US Market', ticker: 'VTI', color: '#0f766e' },
];

type CsvRow = Record<string, string>;

type ModelConfig = {
  id: string;
  name: string;
  description?: string;
  repo: string;
  logs_path: string;
  branch: string;
  enabled: boolean;
  color: string;
};

type PortfolioPoint = {
  timestamp: string;
  value: number;
  raw: CsvRow;
};

type DailyPoint = {
  timestamp: string;
  value: number;
  raw?: CsvRow;
};

const ACCOUNT_VALUE_KEYS = [
  'net_liquidation',
  'net_liquidation_value',
  'netliquidation',
  'netLiquidation',
  'NetLiquidation',
  'nlv',
  'NLV',
  'portfolio_value',
  'equity',
  'account_value',
  'total_equity',
];

function rawUrl(repoFullName: string, branch: string, path: string) {
  const cleanPath = path.replace(/^\/+/, '');
  return `https://raw.githubusercontent.com/${repoFullName}/${branch}/${cleanPath}`;
}

async function fetchTextFromRaw(repoFullName: string, branch: string, path: string) {
  try {
    const response = await fetch(rawUrl(repoFullName, branch, path), {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) return '';
    return response.text();
  } catch {
    return '';
  }
}

async function fetchCsvFromModel(model: ModelConfig, relativePath: string): Promise<CsvRow[]> {
  try {
    const fullPath = `${model.logs_path.replace(/\/+$/, '')}/${relativePath.replace(/^\/+/, '')}`;
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', fullPath);

    if (!text.trim()) return [];

    const parsed = Papa.parse<CsvRow>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return parsed.data || [];
  } catch {
    return [];
  }
}

async function fetchJsonFromModel<T>(model: ModelConfig, relativePath: string): Promise<T | null> {
  try {
    const fullPath = `${model.logs_path.replace(/\/+$/, '')}/${relativePath.replace(/^\/+/, '')}`;
    const text = await fetchTextFromRaw(model.repo, model.branch || 'main', fullPath);

    if (!text.trim()) return null;

    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function fetchModelsRegistry(): Promise<ModelConfig[]> {
  const text = await fetchTextFromRaw(
    `${REGISTRY_OWNER}/${REGISTRY_REPO}`,
    REGISTRY_BRANCH,
    'models.yaml'
  );

  const parsed = parseSimpleModelsYaml(text);

  return parsed.length
    ? parsed.filter((m) => m.enabled !== false)
    : [
        {
          id: 'model_a',
          name: 'BR-PPO V10 (original)',
          description: 'Fallback model from Base_Model_BR_PPO.',
          repo: 'FinTechEntrepreneurldz/Base_Model_BR_PPO',
          logs_path: 'logs/model_a',
          branch: 'main',
          enabled: true,
          color: '#00d4aa',
        },
      ];
}

function parseSimpleModelsYaml(text: string): ModelConfig[] {
  const lines = text.split('\n');
  const models: ModelConfig[] = [];
  let current: Partial<ModelConfig> | null = null;

  function cleanValue(value: string) {
    return value
      .trim()
      .replace(/^['"]/, '')
      .replace(/['"]$/, '');
  }

  function commitCurrent() {
    if (!current?.id) return;

    models.push({
      id: current.id,
      name: current.name || current.id,
      description: current.description || '',
      repo: current.repo || `${REGISTRY_OWNER}/${REGISTRY_REPO}`,
      logs_path: current.logs_path || `logs/${current.id}`,
      branch: current.branch || 'main',
      enabled: current.enabled !== false,
      color: current.color || '#4b3fd1',
    });
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#') || line === 'models:') continue;

    if (line.startsWith('- ')) {
      commitCurrent();
      current = {};

      const rest = line.slice(2).trim();

      if (rest.includes(':')) {
        const [key, ...valueParts] = rest.split(':');
        const keyName = key.trim() as keyof ModelConfig;
        const value = cleanValue(valueParts.join(':'));
        setYamlValue(current, keyName, value);
      }

      continue;
    }

    if (current && line.includes(':')) {
      const [key, ...valueParts] = line.split(':');
      const keyName = key.trim() as keyof ModelConfig;
      const value = cleanValue(valueParts.join(':'));
      setYamlValue(current, keyName, value);
    }
  }

  commitCurrent();

  return models;
}

function setYamlValue(target: Partial<ModelConfig>, key: keyof ModelConfig, value: string) {
  if (key === 'enabled') {
    target.enabled = value.toLowerCase() !== 'false';
    return;
  }

  if (
    key === 'id' ||
    key === 'name' ||
    key === 'description' ||
    key === 'repo' ||
    key === 'logs_path' ||
    key === 'branch' ||
    key === 'color'
  ) {
    target[key] = value as never;
  }
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function startingCapitalForModel(model: ModelConfig): number | null {
  if (!ACCOUNT_BASELINE_MODEL_IDS.has(model.id)) return null;
  return Number.isFinite(DEFAULT_ACCOUNT_STARTING_CAPITAL)
    ? DEFAULT_ACCOUNT_STARTING_CAPITAL
    : null;
}

function performanceValues(values: number[], baseline: number | null) {
  if (!values.length || baseline === null) return values;
  return values[0] === baseline ? values : [baseline, ...values];
}

function latest<T>(arr: T[]): T | null {
  return arr.length ? arr[arr.length - 1] : null;
}

function timestampToDateKey(timestamp: string | undefined) {
  if (!timestamp) return '';

  const clean = String(timestamp).trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(clean)) {
    return clean.slice(0, 10);
  }

  const normalized = clean.replace('_', 'T');
  const date = new Date(normalized);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }

  return '';
}

function previousDateKey(dateKey: string | undefined) {
  if (!dateKey) return '';

  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';

  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function timestampSortValue(timestamp: string | undefined) {
  if (!timestamp) return 0;

  const clean = String(timestamp).trim().replace('_', 'T');
  const date = new Date(clean);

  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  const dateKey = timestampToDateKey(timestamp);
  const fallback = new Date(`${dateKey}T00:00:00Z`);

  return Number.isNaN(fallback.getTime()) ? 0 : fallback.getTime();
}

function accountValue(row: CsvRow): number | null {
  const status = String(row.account_status || row.status || '').toLowerCase();
  if (status.includes('dry_run') || status.includes('dry-run')) return null;

  for (const key of ACCOUNT_VALUE_KEYS) {
    const value = num(row[key]);
    if (value !== null) return value;
  }
  return null;
}

function normalizePortfolioRows(rows: CsvRow[]): PortfolioPoint[] {
  return rows
    .map((row) => {
      const value = accountValue(row);

      return {
        timestamp: row.timestamp_utc || row.timestamp || row.date || '',
        value,
        raw: row,
      };
    })
    .filter((row) => row.timestamp && row.value !== null) as PortfolioPoint[];
}

function accountValueObservations(groups: CsvRow[][]): PortfolioPoint[] {
  return groups.flatMap((rows) => normalizePortfolioRows(rows));
}

function submittedOrderCount(rows: CsvRow[]) {
  return rows.filter((row) => String(row.submitted).toLowerCase() === 'true').length;
}

function hasLivePositionRows(rows: CsvRow[]) {
  return rows.some((row) => {
    const qty = num(row.qty) ?? 0;
    const marketValue = num(row.market_value) ?? 0;
    return Math.abs(qty) > 0 || Math.abs(marketValue) > 0;
  });
}

function inferPaperStatus(positionsRows: CsvRow[], submittedOrdersRows: CsvRow[]) {
  const submitted = submittedOrderCount(submittedOrdersRows);
  const hasPositions = hasLivePositionRows(positionsRows);

  if (submitted > 0 || hasPositions) {
    return {
      isLivePaperActive: true,
      paperStatus: 'Live Paper Active',
      submittedOrderCount: submitted,
      hasLivePositions: hasPositions,
    };
  }

  return {
    isLivePaperActive: false,
    paperStatus: 'Pending',
    submittedOrderCount: submitted,
    hasLivePositions: hasPositions,
  };
}

function toDailyPortfolio(points: PortfolioPoint[]): DailyPoint[] {
  const byDate = new Map<string, DailyPoint & { sortValue: number }>();

  for (const point of points) {
    const dateKey = timestampToDateKey(point.timestamp);
    if (!dateKey) continue;

    const sortValue = timestampSortValue(point.timestamp);
    const existing = byDate.get(dateKey);

    if (!existing || sortValue >= existing.sortValue) {
      byDate.set(dateKey, {
        timestamp: dateKey,
        value: point.value,
        raw: point.raw,
        sortValue,
      });
    }
  }

  return Array.from(byDate.values())
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .map(({ timestamp, value, raw }) => ({ timestamp, value, raw }));
}

function calculateDrawdown(values: number[]) {
  let peak = values[0] || 0;

  return values.map((value) => {
    peak = Math.max(peak, value);
    return peak ? value / peak - 1 : 0;
  });
}

function actionCounts(rows: CsvRow[]) {
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const action = row.action || row.signal || row.decision || 'unknown';
    counts[action] = (counts[action] || 0) + 1;
  }

  return Object.entries(counts).map(([action, count]) => ({
    action,
    count,
  }));
}

async function fetchYahooBenchmark(ticker: string, startDate?: string) {
  try {
    const start = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date('2024-01-01T00:00:00Z');
    const end = new Date();

    if (Number.isNaN(start.getTime())) return [];

    const period1 = Math.floor(start.getTime() / 1000);
    const period2 = Math.floor(end.getTime() / 1000);

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?period1=${period1}&period2=${period2}&interval=1d&events=history`;

    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) return [];

    const json = await response.json();
    const result = json?.chart?.result?.[0];

    const timestamps: number[] = result?.timestamp || [];
    const closes: Array<number | null> = result?.indicators?.quote?.[0]?.close || [];

    const clean = timestamps
      .map((ts, i) => ({
        timestamp: new Date(ts * 1000).toISOString().slice(0, 10),
        close: closes[i],
      }))
      .filter((row) => row.close !== null && Number.isFinite(row.close));

    if (clean.length < 2) return [];

    const first = clean[0].close as number;

    return clean.map((row) => ({
      timestamp: row.timestamp,
      value: ((row.close as number) / first) * 100,
      close: row.close as number,
    }));
  } catch {
    return [];
  }
}

async function fetchBenchmarks(startDate?: string) {
  const results = await Promise.all(
    BENCHMARKS.map(async (benchmark) => {
      const points = await fetchYahooBenchmark(benchmark.ticker, startDate);
      const values = points.map((point) => point.value);

      return {
        ...benchmark,
        points,
        stats: computeStats(values),
        rowCount: points.length,
      };
    })
  );

  return results;
}

async function benchmarkStartDateFromFirstModel(registry: ModelConfig[]) {
  const firstModel =
    registry.find((model) => model.id === 'model_a') ||
    registry.find((model) => model.name.toLowerCase().includes('br-ppo v10')) ||
    registry[0];

  if (!firstModel) return undefined;

  const rows = await fetchCsvFromModel(firstModel, 'portfolio/portfolio.csv');
  const daily = toDailyPortfolio(normalizePortfolioRows(rows));

  return daily.length ? daily[0].timestamp : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const registry = await fetchModelsRegistry();

  const requestedModel = searchParams.get('model');
  const selectedModelConfig =
    registry.find((m) => m.id === requestedModel) ||
    registry.find((m) => m.id === DEFAULT_MODEL_ID) ||
    registry[0];

  const selectedModel = selectedModelConfig.id;

  const [
    portfolioRows,
    latestDecisionRows,
    decisionsRows,
    targetWeightsRows,
    targetWeightHistoryRows,
    positionsRows,
    plannedOrdersRows,
    submittedOrdersRows,
    ordersHistoryRows,
    signalHistoryRows,
    healthStatus,
    benchmarkStartDate,
  ] = await Promise.all([
    fetchCsvFromModel(selectedModelConfig, 'portfolio/portfolio.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/latest_decision.csv'),
    fetchCsvFromModel(selectedModelConfig, 'decisions/decisions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/latest_target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'target_weights/target_weights.csv'),
    fetchCsvFromModel(selectedModelConfig, 'positions/latest_positions.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_planned_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/latest_submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'orders/submitted_orders.csv'),
    fetchCsvFromModel(selectedModelConfig, 'health/signal_history.csv'),
    fetchJsonFromModel<Record<string, unknown>>(
      selectedModelConfig,
      'health/health_status.json'
    ),
    benchmarkStartDateFromFirstModel(registry),
  ]);

  const paperStatus = inferPaperStatus(positionsRows, submittedOrdersRows);
  const portfolio = accountValueObservations([
    portfolioRows,
    latestDecisionRows,
    decisionsRows,
    signalHistoryRows,
  ]);
  const dailyPortfolio = toDailyPortfolio(portfolio);
  const values = dailyPortfolio.map((p) => p.value);
  const accountBaseline = startingCapitalForModel(selectedModelConfig);
  const selectedPerformanceValues = performanceValues(values, accountBaseline);
  const normalizedValues = normalizeTo100(values);
  const returns = pctChange(values);
  const drawdowns = calculateDrawdown(values);
  const stats = computeStats(selectedPerformanceValues);

  const equityCurve = dailyPortfolio.map((p, i) => ({
    timestamp: p.timestamp,
    portfolio: normalizedValues[i],
    portfolioValue: p.value,
    drawdown: drawdowns[i],
    return: i === 0 ? 0 : returns[i - 1] ?? 0,
  }));

  const benchmarks = await fetchBenchmarks(benchmarkStartDate);

    const modelComparison = [];

  for (const model of registry) {
    const rows = await fetchCsvFromModel(model, 'portfolio/portfolio.csv');
    const daily = toDailyPortfolio(normalizePortfolioRows(rows));
    const modelValues = daily.map((p) => p.value);
    const modelBaseline = startingCapitalForModel(model);
    const modelPerformanceValues = performanceValues(modelValues, modelBaseline);
    const curve = normalizeTo100(modelPerformanceValues);

    const modelInceptionDate = daily.length ? daily[0].timestamp : undefined;
    const modelBenchmarks = await fetchBenchmarks(modelInceptionDate);

    modelComparison.push({
      id: model.id,
      name: model.name,
      description: model.description,
      repo: model.repo,
      logsPath: model.logs_path,
      color: model.color,
      points: modelPerformanceValues.map((value, i) => ({
        timestamp:
          modelBaseline !== null && modelValues[0] !== modelBaseline
            ? i === 0
              ? previousDateKey(modelInceptionDate)
              : daily[i - 1]?.timestamp
            : daily[i]?.timestamp,
        value: curve[i],
      })),
      stats: computeStats(modelPerformanceValues),
      latestValue: modelValues.length ? modelValues[modelValues.length - 1] : null,
      startingCapital: modelBaseline,
      rowCount: rows.length,
      dailyRowCount: daily.length,
      inceptionDate: modelInceptionDate || null,
      benchmarks: modelBenchmarks,
    });
  }

  return NextResponse.json({
    repo: {
      owner: REGISTRY_OWNER,
      repo: REGISTRY_REPO,
      branch: REGISTRY_BRANCH,
      rawBase: `https://raw.githubusercontent.com/${REGISTRY_OWNER}/${REGISTRY_REPO}/${REGISTRY_BRANCH}`,
    },
    selectedModel,
    selectedModelConfig,
    registry,
    latest: {
        decision: latest(latestDecisionRows),
      
        // SOURCE OF TRUTH: portfolio/portfolio.csv
        portfolioValue: values.length ? values[values.length - 1] : null,
        firstPortfolioValue: values.length ? accountBaseline ?? values[0] : null,
        startingCapital: accountBaseline,
        portfolioPnl:
          values.length ? values[values.length - 1] - (accountBaseline ?? values[0]) : null,
        portfolioReturn:
          values.length && (accountBaseline ?? values[0]) !== 0
            ? values[values.length - 1] / (accountBaseline ?? values[0]) - 1
            : null,
      
        // Do NOT derive P&L from positions market_value.
        pnlSource:
          accountBaseline !== null
            ? 'ibkr_net_liquidation_minus_starting_capital'
            : 'portfolio_csv_net_liquidation',
        isLivePaperActive: paperStatus.isLivePaperActive,
        paperStatus: paperStatus.paperStatus,
        submittedOrderCount: paperStatus.submittedOrderCount,
        hasLivePositions: paperStatus.hasLivePositions
          },
    stats,
    equityCurve,
    benchmarks,
    returns: returns.map((r, i) => ({
      timestamp: dailyPortfolio[i + 1]?.timestamp,
      return: r,
    })),
    drawdowns: equityCurve.map((p) => ({
      timestamp: p.timestamp,
      drawdown: p.drawdown,
    })),
    modelComparison,
    decisions: decisionsRows,
    actionCounts: actionCounts(decisionsRows),
    targetWeights: targetWeightsRows,
    targetWeightHistory: targetWeightHistoryRows,
    positions: positionsRows,
    plannedOrders: plannedOrdersRows,
    submittedOrders: submittedOrdersRows,
    ordersHistory: ordersHistoryRows,
    signalHistory: signalHistoryRows,
    healthStatus,
    debug: {
      requestedModel,
      selectedModel,
      benchmarkStartDate,
      registryCount: registry.length,
      registry: registry.map((m) => ({
        id: m.id,
        name: m.name,
        repo: m.repo,
        logs_path: m.logs_path,
        branch: m.branch,
        enabled: m.enabled,
        paperStatus
      })),
      selectedModelConfig,
      rowCounts: {
        portfolioRows: portfolioRows.length,
        dailyPortfolioRows: dailyPortfolio.length,
        latestDecisionRows: latestDecisionRows.length,
        decisionsRows: decisionsRows.length,
        targetWeightsRows: targetWeightsRows.length,
        targetWeightHistoryRows: targetWeightHistoryRows.length,
        positionsRows: positionsRows.length,
        plannedOrdersRows: plannedOrdersRows.length,
        submittedOrdersRows: submittedOrdersRows.length,
        ordersHistoryRows: ordersHistoryRows.length,
        signalHistoryRows: signalHistoryRows.length,
      },
      modelComparisonRows: modelComparison.map((m) => ({
        id: m.id,
        rowCount: m.rowCount,
        dailyRowCount: m.dailyRowCount,
        inceptionDate: m.inceptionDate,
        repo: m.repo,
        logsPath: m.logsPath,
      })),
      benchmarkRows: benchmarks.map((b) => ({
        name: b.name,
        ticker: b.ticker,
        rowCount: b.rowCount,
      })),
    },
    updatedAt: new Date().toISOString(),
  });
}
