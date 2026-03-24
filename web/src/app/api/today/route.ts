import { NextResponse } from "next/server";
import { getTodayData } from "@/lib/sources";

export const revalidate = 3600;

export async function GET() {
  const data = await getTodayData();
  return NextResponse.json(data);
}
