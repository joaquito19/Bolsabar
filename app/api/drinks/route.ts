import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId") || process.env.DEFAULT_VENUE_ID || "default-venue";
  const drinks = await prisma.drink.findMany({ where: { venueId, isActive: true }, orderBy: { name: "asc" } });
  return NextResponse.json(drinks);
}

export async function POST(req: NextRequest) {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const body = await req.json();
  const d = await prisma.drink.create({
    data: {
      venueId,
      name: body.name,
      code: body.code || body.name.toUpperCase().slice(0,5),
      basePrice: body.basePrice,
      minPrice: body.minPrice,
      maxPrice: body.maxPrice,
      volatility: body.volatility ?? 0.05
    }
  });
  return NextResponse.json(d);
}
