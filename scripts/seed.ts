import { prisma } from "../src/lib/prisma";

async function run() {
  const venueId = process.env.DEFAULT_VENUE_ID || "default-venue";
  await prisma.venue.upsert({ where: { id: venueId }, update: {}, create: { id: venueId, name: "Bar Bolsa Centro", currency: "UYU", timezone: process.env.VENUE_TZ || "America/Montevideo" } });
  const count = await prisma.drink.count({ where: { venueId } });
  if (count === 0) {
    const items = [
      { name: "Negroni", code: "NEGR", base: 320, min: 260, max: 420, vol: 0.04 },
      { name: "Gin Tonic", code: "GTON", base: 280, min: 220, max: 380, vol: 0.05 },
      { name: "Old Fashioned", code: "OLDF", base: 350, min: 290, max: 480, vol: 0.05 },
      { name: "Margarita", code: "MARG", base: 300, min: 240, max: 420, vol: 0.06 },
    ];
    for (const d of items) {
      await prisma.drink.create({ data: { venueId, name: d.name, code: d.code, basePrice: d.base, minPrice: d.min, maxPrice: d.max, volatility: d.vol } });
    }
    await prisma.config.upsert({ where: { venueId }, update: {}, create: { venueId, priceTickSec: 90, quoteTtlSec: 60, currency: "UYU" } });
    console.log("Seed completo");
  } else {
    console.log("Catálogo ya existe");
  }
}
run().then(()=>process.exit(0));
