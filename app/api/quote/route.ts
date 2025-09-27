import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { redis } from "@/src/lib/redis";

export async function POST(req: NextRequest) {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const { drinkId } = await req.json();
  const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
  if (!drink) return NextResponse.json({ error: "DRINK_NOT_FOUND" }, { status: 404 });
  const priceStr = await redis.get(`venue:${venueId}:drink:${drinkId}:price`);
  const price = priceStr ? parseFloat(priceStr) : Number(drink.basePrice);

  const cfg = await prisma.config.findUnique({ where: { venueId } });
  const ttl = cfg?.quoteTtlSec ?? 60;
  const quoteId = crypto.randomUUID();
  await redis.setex(`quote:${quoteId}`, ttl, JSON.stringify({ price, venueId, drinkId }));
  return NextResponse.json({ quoteId, price, expiresIn: ttl });
}
