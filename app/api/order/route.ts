import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { redis } from "@/src/lib/redis";

export async function POST(req: NextRequest) {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  const { tableId, drinkId, quantity, source, quoteId, note } = await req.json();

  let priceAtOrder: number;
  if (quoteId) {
    const q = await redis.get(`quote:${quoteId}`);
    if (!q) return NextResponse.json({ error: "QUOTE_EXPIRED" }, { status: 400 });
    const obj = JSON.parse(q);
    if (obj.venueId !== venueId || obj.drinkId !== drinkId) return NextResponse.json({ error: "QUOTE_MISMATCH" }, { status: 400 });
    priceAtOrder = obj.price;
    await redis.del(`quote:${quoteId}`);
  } else {
    const drink = await prisma.drink.findUnique({ where: { id: drinkId } });
    if (!drink) return NextResponse.json({ error: "DRINK_NOT_FOUND" }, { status: 404 });
    const priceStr = await redis.get(`venue:${venueId}:drink:${drinkId}:price`);
    priceAtOrder = priceStr ? parseFloat(priceStr) : Number(drink.basePrice);
  }

  const order = await prisma.order.create({
    data: {
      venueId, tableId, drinkId, quantity: quantity ?? 1, source: source ?? "TABLET",
      priceAtOrder, note
    }
  });

  await redis.incrbyfloat(`venue:${venueId}:drink:${drinkId}:demand`, (quantity ?? 1) * 0.2);

  return NextResponse.json({ id: order.id });
}
