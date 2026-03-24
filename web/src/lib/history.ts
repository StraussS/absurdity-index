import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { DailyAbsurdity } from "@/lib/absurdity";

const HISTORY_DIR = path.join(process.cwd(), "data", "history");

export type HistorySnapshot = Pick<DailyAbsurdity, "date" | "daily_index" | "level" | "summary" | "keywords" | "top_items"> & {
  saved_at: string;
};

function normalizeDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function snapshotPath(date: string) {
  return path.join(HISTORY_DIR, `${date}.json`);
}

export async function saveDailySnapshot(data: DailyAbsurdity) {
  await mkdir(HISTORY_DIR, { recursive: true });
  const snapshot: HistorySnapshot = {
    date: data.date,
    daily_index: data.daily_index,
    level: data.level,
    summary: data.summary,
    keywords: data.keywords,
    top_items: data.top_items,
    saved_at: new Date().toISOString(),
  };
  await writeFile(snapshotPath(data.date), JSON.stringify(snapshot, null, 2), "utf8");
}

export async function loadDailySnapshot(date: string) {
  try {
    const raw = await readFile(snapshotPath(date), "utf8");
    return JSON.parse(raw) as HistorySnapshot;
  } catch {
    return null;
  }
}

export async function loadRecentHistory(days = 7) {
  const dates = Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - index));
    return normalizeDate(date);
  });

  const snapshots = await Promise.all(dates.map((date) => loadDailySnapshot(date)));
  return snapshots.filter(Boolean) as HistorySnapshot[];
}

export function mergeTrendFromHistory(current: DailyAbsurdity, history: HistorySnapshot[]) {
  const trendMap = new Map(history.map((item) => [item.date, item.daily_index]));
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return normalizeDate(date);
  });

  return days.map((date, index) => {
    if (date === current.date) return current.daily_index;
    return trendMap.get(date) ?? current.trend[index] ?? current.daily_index;
  });
}

export async function listHistorySnapshots() {
  try {
    await mkdir(HISTORY_DIR, { recursive: true });
    const files = await readdir(HISTORY_DIR);
    const snapshots = await Promise.all(
      files
        .filter((file) => file.endsWith('.json'))
        .map((file) => loadDailySnapshot(file.replace(/\.json$/, ''))),
    );
    return snapshots.filter(Boolean).sort((a, b) => (a!.date < b!.date ? 1 : -1)) as HistorySnapshot[];
  } catch {
    return [];
  }
}
