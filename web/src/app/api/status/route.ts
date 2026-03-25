import { NextResponse } from "next/server";
import { getProjectStatus } from "@/lib/project-status";

export const revalidate = 300;

export async function GET() {
  const data = await getProjectStatus();
  return NextResponse.json(data);
}
