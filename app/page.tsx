export default function Home() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold">BolsaBar</h1>
      <p className="mt-2">MVP con precios dinámicos de tragos.</p>
      <ul className="list-disc ml-6 mt-6 space-y-2">
        <li><a className="underline" href="/tablet">Vista Tablet (mesas)</a></li>
        <li><a className="underline" href="/screen">Vista Pantalla Gigante</a></li>
        <li><a className="underline" href="/admin">Panel Admin</a></li>
      </ul>
      <p className="mt-10 text-sm text-zinc-600">Configura variables en <code>.env</code> y usa el endpoint <code>/api/seed</code> para cargar demo.</p>
    </div>
  );
}
