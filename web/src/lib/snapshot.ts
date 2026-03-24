import { getTodayData } from "@/lib/sources";

export async function runSnapshot() {
  const data = await getTodayData();
  return {
    date: data.date,
    daily_index: data.daily_index,
    level: data.level,
    top_items: data.top_items.length,
    keywords: data.keywords,
  };
}
