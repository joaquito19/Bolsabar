"use client";
import { useEffect, useState } from "react";

type Config = { priceTickSec: number; quoteTtlSec: number; currency: string };
type Drink = { id: string; name: string; code: string; basePrice: number; minPrice: number; maxPrice: number; volatility: number; isActive: boolean };

export default function Admin() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [newDrink, setNewDrink] = useState({ name: "", code: "", basePrice: 300, minPrice: 240, maxPrice: 420, volatility: 0.05 });

  async function load() {
    const c = await fetch("/api/config"); setCfg(await c.json());
    const d = await fetch("/api/drinks"); setDrinks(await d.json());
  }
  useEffect(() => { load(); }, []);

  async function saveCfg() {
    await fetch("/api/config", { method: "POST", body: JSON.stringify(cfg) });
    alert("Configuración guardada");
  }
  async function addDrink() {
    await fetch("/api/drinks", { method: "POST", body: JSON.stringify(newDrink) });
    setNewDrink({ name: "", code: "", basePrice: 300, minPrice: 240, maxPrice: 420, volatility: 0.05 });
    await load();
  }
  async function updateDrink(d: any) {
    await fetch(`/api/drinks/${d.id}`, { method: "PATCH", body: JSON.stringify(d) });
    await load();
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      <h1 className="text-3xl font-bold">Panel Admin</h1>

      <section className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Configuración</h2>
        {cfg && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <label className="flex flex-col">Intervalo de tick (seg)
              <input type="number" className="border p-2 rounded" value={cfg.priceTickSec} onChange={e => setCfg({ ...cfg, priceTickSec: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col">TTL de quote (seg)
              <input type="number" className="border p-2 rounded" value={cfg.quoteTtlSec} onChange={e => setCfg({ ...cfg, quoteTtlSec: Number(e.target.value) })} />
            </label>
            <label className="flex flex-col">Moneda (ej. UYU)
              <input className="border p-2 rounded" value={cfg.currency} onChange={e => setCfg({ ...cfg, currency: e.target.value })} />
            </label>
            <div className="col-span-2">
              <button onClick={saveCfg} className="mt-2 px-4 py-2 rounded bg-black text-white">Guardar</button>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Bebidas</h2>
        <div className="grid grid-cols-6 gap-2 items-end mt-4">
          <input placeholder="Nombre" className="border p-2 rounded col-span-2" value={newDrink.name} onChange={e => setNewDrink({ ...newDrink, name: e.target.value })} />
          <input placeholder="Código" className="border p-2 rounded" value={newDrink.code} onChange={e => setNewDrink({ ...newDrink, code: e.target.value })} />
          <input type="number" placeholder="Base" className="border p-2 rounded" value={newDrink.basePrice} onChange={e => setNewDrink({ ...newDrink, basePrice: Number(e.target.value) })} />
          <input type="number" placeholder="Min" className="border p-2 rounded" value={newDrink.minPrice} onChange={e => setNewDrink({ ...newDrink, minPrice: Number(e.target.value) })} />
          <input type="number" placeholder="Max" className="border p-2 rounded" value={newDrink.maxPrice} onChange={e => setNewDrink({ ...newDrink, maxPrice: Number(e.target.value) })} />
          <input type="number" step="0.01" placeholder="Vol" className="border p-2 rounded" value={newDrink.volatility} onChange={e => setNewDrink({ ...newDrink, volatility: Number(e.target.value) })} />
          <button onClick={addDrink} className="px-3 py-2 rounded bg-black text-white col-span-6">Agregar bebida</button>
        </div>

        <div className="mt-6 border-t pt-4 space-y-3">
          {drinks.map((d) => (
            <div key={d.id} className="grid grid-cols-8 gap-2 items-center">
              <input className="border p-2 rounded col-span-2" defaultValue={d.name} onChange={e => d.name = e.target.value} />
              <input className="border p-2 rounded" defaultValue={d.code} onChange={e => d.code = e.target.value} />
              <input type="number" className="border p-2 rounded" defaultValue={d.basePrice} onChange={e => d.basePrice = Number(e.target.value)} />
              <input type="number" className="border p-2 rounded" defaultValue={d.minPrice} onChange={e => d.minPrice = Number(e.target.value)} />
              <input type="number" className="border p-2 rounded" defaultValue={d.maxPrice} onChange={e => d.maxPrice = Number(e.target.value)} />
              <input type="number" step="0.01" className="border p-2 rounded" defaultValue={d.volatility} onChange={e => d.volatility = Number(e.target.value)} />
              <label className="flex items-center gap-2"><input type="checkbox" defaultChecked={d.isActive} onChange={e => d.isActive = e.target.checked} /> Activa</label>
              <button onClick={() => updateDrink(d)} className="px-3 py-2 rounded bg-zinc-900 text-white">Guardar</button>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 bg-white rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Happy Hour</h2>
        <p className="text-sm text-zinc-600">Crea reglas recurrentes. El motor aplica 15% OFF por defecto.</p>
        <HappyHourForm />
      </section>
    </div>
  );
}

function HappyHourForm() {
  const [days, setDays] = useState<string[]>([]);
  const [start, setStart] = useState("18:00");
  const [dur, setDur] = useState(120);
  const [discount, setDiscount] = useState(0.15);
  const dow = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

  async function save() {
    await fetch("/api/happyhour", { method: "POST", body: JSON.stringify({
      daysOfWeek: days.join(","), startLocal: start, durationMin: dur, discountPct: discount, active: true
    }) });
    alert("Regla guardada");
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2 flex-wrap">
        {dow.map(d => (
          <label key={d} className={"px-3 py-1 rounded border " + (days.includes(d) ? "bg-black text-white" : "")}>
            <input type="checkbox" className="hidden" checked={days.includes(d)} onChange={(e) => {
              setDays(prev => e.target.checked ? [...prev, d] : prev.filter(x => x !== d));
            }} />
            {d}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col">Inicio (HH:mm)<input value={start} onChange={e => setStart(e.target.value)} className="border p-2 rounded" /></label>
        <label className="flex flex-col">Duración (min)<input type="number" value={dur} onChange={e => setDur(Number(e.target.value))} className="border p-2 rounded" /></label>
        <label className="flex flex-col">Descuento (0-1)<input type="number" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="border p-2 rounded" /></label>
      </div>
      <button onClick={save} className="px-4 py-2 rounded bg-black text-white">Guardar regla</button>
    </div>
  );
}
