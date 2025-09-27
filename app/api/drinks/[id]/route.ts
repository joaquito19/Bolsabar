import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const d = await prisma.drink.update({
    where: { id: params.id },
    data: {
      name: body.name ?? undefined,
      code: body.code ?? undefined,
      basePrice: body.basePrice ?? undefined,
      minPrice: body.minPrice ?? undefined,
      maxPrice: body.maxPrice ?? undefined,
      volatility: body.volatility ?? undefined,
      isActive: body.isActive ?? undefined
    }
  });
  return NextResponse.json(d);
}
