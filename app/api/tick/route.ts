import { NextRequest, NextResponse } from "next/server";
import { priceTick } from "@/src/lib/pricing";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = (auth.split("Bearer ")[1] || "").trim();
  const secret = process.env.CRON_SECRET || "";
  if (!secret || token !== secret) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const venueId = body.venueId || process.env.DEFAULT_VENUE_ID || "default-venue";
  const res = await priceTick(venueId);
  return NextResponse.json(res);
}
