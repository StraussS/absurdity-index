import { NextResponse } from "next/server";
import { getTodayData } from "@/lib/sources";

export const revalidate = 1800;

export async function GET() {
  const data = await getTodayData();
  return NextResponse.json(data);
}
