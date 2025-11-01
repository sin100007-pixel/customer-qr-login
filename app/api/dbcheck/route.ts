import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = await prisma.$queryRaw`select now()`;
    return NextResponse.json({ status: "ok", now });
  } catch (e: any) {
    return NextResponse.json({ status: "error", message: e?.message || "unknown" }, { status: 500 });
  }
}
