import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic"; // 캐싱 방지

export async function GET() {
  try {
    // 아주 가벼운 쿼리로 연결성 체크
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, message: e?.message }, { status: 503 });
  }
}