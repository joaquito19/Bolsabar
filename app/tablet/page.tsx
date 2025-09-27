"use client";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; price: number; changePct: number };

export default function Tablet() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPrices() {
    const r = await fetch("/api/prices");
    const j = await r.json();
    setItems(j.list);
    setLoading(false);
  }

  useEffect(() => {
    fetchPrices();
    const i = setInterval(fetchPrices, 3000);
    return () => clearInterval(i);
  }, []);

  async function freezeAndOrder(drinkId: string) {
    const q = await fetch("/api/quote", { method: "POST", body: JSON.stringify({ drinkId }) });
    const jq = await q.json();
    if (jq.error) { alert(jq.error); return; }
    const res = await fetch("/api/order", { method: "POST", body: JSON.stringify({ drinkId, quantity: 1, source: "TABLET", quoteId: jq.quoteId }) });
    const jr = await res.json();
    if (jr.error) alert(jr.error); else alert(`Orden ${jr.id} creada a ${jq.price} UYU`);
  }

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
      {loading && <div>Cargando...</div>}
      {items.map((it) => {
        const up = (it.changePct || 0) >= 0;
        return (
          <div key={it.id} className="rounded-2xl shadow p-4 bg-white flex flex-col justify-between">
            <div>
              <div className="text-lg font-semibold">{it.name}</div>
              <div className="text-3xl font-bold mt-2">{it.price.toFixed(2)} UYU</div>
              <div className={up ? "text-green-600" : "text-red-600"}>{(it.changePct * 100).toFixed(1)}%</div>
            </div>
            <button onClick={() => freezeAndOrder(it.id)} className="mt-4 w-full rounded-2xl py-3 bg-black text-white">Congelar y pedir</button>
          </div>
        );
      })}
    </div>
  );
}
