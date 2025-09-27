"use client";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; price: number; changePct: number };

export default function Screen() {
  const [items, setItems] = useState<Item[]>([]);

  async function fetchPrices() {
    const r = await fetch("/api/prices");
    const j = await r.json();
    setItems(j.list);
  }

  useEffect(() => {
    fetchPrices();
    const i = setInterval(fetchPrices, 4000);
    return () => clearInterval(i);
  }, []);

  const rows = [...items].sort((a, b) => (b.changePct || 0) - (a.changePct || 0));

  return (
    <div className="w-screen h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold">Bolsa de tragos</h1>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {rows.map((it) => {
          const up = (it.changePct || 0) >= 0;
          return (
            <div key={it.id} className="rounded-2xl p-4 bg-zinc-900">
              <div className="text-xl font-semibold">{it.name}</div>
              <div className="text-3xl font-bold mt-2">{it.price.toFixed(2)} UYU</div>
              <div className={up ? "text-green-400" : "text-red-400"}>{((it.changePct || 0) * 100).toFixed(1)}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
