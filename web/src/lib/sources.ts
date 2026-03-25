import { DailyAbsurdity } from "@/lib/absurdity";
import { runTodayPipeline } from "@/lib/pipeline";

export async function getTodayData(): Promise<DailyAbsurdity> {
  const { data } = await runTodayPipeline();
  return data;
}
