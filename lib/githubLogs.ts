import Papa from 'papaparse';

const OWNER = process.env.NEXT_PUBLIC_QSENTIA_REPO_OWNER || 'FinTechEntrepreneurldz';
const REPO = process.env.NEXT_PUBLIC_QSENTIA_REPO_NAME || 'Base_Model_BR_PPO';
const BRANCH = process.env.NEXT_PUBLIC_QSENTIA_BRANCH || 'main';

export type CsvRow = Record<string, string>;

export function rawUrl(path: string) {
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
}

export async function fetchCsv(path: string): Promise<CsvRow[]> {
  const response = await fetch(rawUrl(path), { cache: 'no-store' });

  if (!response.ok) {
    return [];
  }

  const text = await response.text();

  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data || [];
}

export async function fetchJson<T>(path: string): Promise<T | null> {
  const response = await fetch(rawUrl(path), { cache: 'no-store' });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export function numberValue(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function modelLogPath(modelId: string, path: string) {
  return `logs/${modelId}/${path}`;
}