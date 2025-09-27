import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET() {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  let cfg = await prisma.config.findUnique({ where: { venueId } });
  if (!cfg) cfg = await prisma.config.create({ data: { venueId } });
  return NextResponse.json(cfg);
}

export async function POST(req: NextRequest) {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const body = await req.json();
  const cfg = await prisma.config.upsert({
    where: { venueId },
    update: {
      priceTickSec: body.priceTickSec ?? undefined,
      quoteTtlSec: body.quoteTtlSec ?? undefined,
      currency: body.currency ?? undefined
    },
    create: {
      venueId,
      priceTickSec: body.priceTickSec ?? 90,
      quoteTtlSec: body.quoteTtlSec ?? 60,
      currency: body.currency ?? "UYU"
    }
  });
  return NextResponse.json(cfg);
}
