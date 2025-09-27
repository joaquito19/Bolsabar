import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const rules = await prisma.happyHourRule.findMany({ where: { venueId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const body = await req.json();
  const r = await prisma.happyHourRule.create({
    data: {
      venueId,
      daysOfWeek: body.daysOfWeek,
      startLocal: body.startLocal,
      durationMin: body.durationMin,
      discountPct: body.discountPct ?? 0.15,
      active: body.active ?? true
    }
  });
  return NextResponse.json(r);
}
