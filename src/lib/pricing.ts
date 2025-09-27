import { prisma } from "@/src/lib/prisma";
import { redis } from "@/src/lib/redis";
import { nowInTZ, isWithinHappyHour } from "@/src/lib/time";

function normalNoise(std = 1) {
  const u = 1 - Math.random();
  const v = 1 - Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std;
}

export async function getConfig(venueId: string) {
  let cfg = await prisma.config.findUnique({ where: { venueId } });
  if (!cfg) cfg = await prisma.config.create({ data: { venueId, priceTickSec: 90, quoteTtlSec: 60, currency: "UYU" } });
  return cfg;
}

export async function priceTick(venueId: string) {
  const venue = await prisma.venue.findUnique({ where: { id: venueId } });
  if (!venue) throw new Error("VENUE_NOT_FOUND");
  await getConfig(venueId);
  const drinks = await prisma.drink.findMany({ where: { venueId, isActive: true } });
  const rules = await prisma.happyHourRule.findMany({ where: { venueId, active: true } });
  const now = nowInTZ(venue.timezone || "America/Montevideo");
  const happy = isWithinHappyHour(now, rules);

  const updates: any[] = [];
  for (const d of drinks) {
    const key = `venue:${venueId}:drink:${d.id}:price`;
    const curStr = await redis.get(key);
    const current = curStr ? parseFloat(curStr) : Number(d.basePrice);
    const demandKey = `venue:${venueId}:drink:${d.id}:demand`;
    const demand = parseFloat((await redis.get(demandKey)) || "0");
    const demandScore = Math.tanh(demand);

    const noise = normalNoise(d.volatility);
    let next = current * (1 + noise + 0.03 * demandScore);
    if (happy) next *= (1 - 0.15);
    const min = Number(d.minPrice), max = Number(d.maxPrice);
    next = Math.max(min, Math.min(max, next));
    const changePct = (next - current) / current;

    await redis.set(key, next.toFixed(2));
    await redis.set(`venue:${venueId}:drink:${d.id}:change`, changePct.toFixed(4));
    await redis.set(demandKey, Math.max(0, demand * 0.5).toFixed(3));

    updates.push({ drinkId: d.id, price: Number(next.toFixed(2)), changePct, ts: Date.now() });
  }

  try {
    for (const u of updates) {
      await prisma.priceHistory.create({ data: { drinkId: u.drinkId, venueId, price: u.price, changePct: u.changePct, reason: happy ? "tick+happy" : "tick" } });
    }
  } catch {}
  return { updates, happy };
}

export async function getLivePrices(venueId: string) {
  const drinks = await prisma.drink.findMany({ where: { venueId, isActive: true }, select: { id: true, name: true, basePrice: true } });
  const list: { id: string; name: string; price: number; changePct: number }[] = [];
  for (const d of drinks) {
    const priceStr = await redis.get(`venue:${venueId}:drink:${d.id}:price`);
    const price = priceStr ? parseFloat(priceStr) : Number(d.basePrice);
    const changeStr = await redis.get(`venue:${venueId}:drink:${d.id}:change`);
    const changePct = changeStr ? parseFloat(changeStr) : 0;
    list.push({ id: d.id, name: d.name, price, changePct });
  }
  return list;
}
