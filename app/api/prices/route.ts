import { NextRequest, NextResponse } from "next/server";
import { getLivePrices } from "@/src/lib/pricing";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get("venueId") || process.env.DEFAULT_VENUE_ID || "default-venue";
  const list = await getLivePrices(venueId);
  return NextResponse.json({ venueId, list });
}
