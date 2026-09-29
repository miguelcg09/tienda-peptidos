"use client";

import { useEffect, useRef, useState } from "react";

export const regiones = [
  "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
  "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía", "Los Ríos",
  "Los Lagos", "Aysén", "Magallanes",
];

type Place = { label: string; address: string; comuna: string; region: string; lat: number; lng: number };

// Dirección de despacho con autocompletado mientras se escribe, botón "usar mi ubicación"
// y mapa con el punto de entrega. Los campos se envían con el resto del formulario.
export function AddressPicker() {
  const [address, setAddress] = useState("");
  const [region, setRegion] = useState("Metropolitana");
  const [comuna, setComuna] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"buscar" | "ubicar" | null>(null);
  const [hint, setHint] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chosen = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Busca sugerencias 350 ms después de la última tecla.
  useEffect(() => {
    clearTimeout(timer.current);
    const q = address.trim();
    if (q.length < 4 || q === chosen.current) { setPlaces([]); return; }
    timer.current = setTimeout(async () => {
      setBusy("buscar");
      try {
        const r = await fetch(`/api/geo?q=${encodeURIComponent(q)}`);
        const data = (await r.json()) as { places: Place[] };
        setPlaces(data.places ?? []);
        // Solo se despliega si el cliente sigue en el campo (no si ya pasó a otro).
        if (document.activeElement === inputRef.current) setOpen(true);
      } catch {
        setPlaces([]);
      } finally {
        setBusy(null);
      }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [address]);

  function pick(p: Place) {
    chosen.current = p.address;
    setAddress(p.address);
    if (p.comuna) setComuna(p.comuna);
    if (regiones.includes(p.region)) setRegion(p.region);
    setCoords({ lat: p.lat, lng: p.lng });
    setPlaces([]);
    setOpen(false);
    setHint("");
  }

  function locate() {
    if (!navigator.geolocation) return setHint("Tu navegador no permite obtener la ubicación.");
    setBusy("ubicar");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        try {
          const r = await fetch(`/api/geo?lat=${c.latitude}&lng=${c.longitude}`);
          const data = (await r.json()) as { place: Place | null };
          if (data.place) pick(data.place);
          else { setCoords({ lat: c.latitude, lng: c.longitude }); setHint("Ubicamos el punto, pero no encontramos la calle: escríbela tú."); }
        } finally {
          setBusy(null);
        }
      },
      () => { setBusy(null); setHint("No pudimos obtener tu ubicación. Escribe la dirección."); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const d = 0.004;
  const mapSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${coords.lng - d},${coords.lat - d * 0.7},${coords.lng + d},${coords.lat + d * 0.7}&layer=mapnik&marker=${coords.lat},${coords.lng}`
    : "";

  return (
    <>
      <div className="relative text-sm sm:col-span-2">
        <label>
          Dirección
          <input
            ref={inputRef}
            name="address"
            required
            autoComplete="off"
            value={address}
            onChange={(e) => { setAddress(e.target.value); if (coords) setCoords(null); }}
            onFocus={() => places.length && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Escribe calle y número, por ejemplo Los Leones 45"
            className="field"
          />
        </label>
        {busy === "buscar" && <span className="absolute right-3 top-9 text-xs text-muted">Buscando…</span>}
        {open && places.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border bg-surface shadow-xl">
            {places.map((p) => (
              <li key={p.label}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-accent/10">
                  <span className="mt-0.5 text-accent">📍</span>
                  <span>
                    <span className="block font-medium">{p.address}</span>
                    <span className="block text-xs text-muted">{[p.comuna, p.region].filter(Boolean).join(", ")}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
          <button type="button" onClick={locate} disabled={busy === "ubicar"} className="rounded-full border px-3 py-1 text-fg transition hover:border-accent">
            {busy === "ubicar" ? "Ubicando…" : "📡 Usar mi ubicación"}
          </button>
          <span>Las sugerencias completan comuna y región y marcan el punto en el mapa.</span>
        </div>
        {hint && <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{hint}</p>}
      </div>

      <label className="text-sm">Región
        <select name="region" required value={region} onChange={(e) => setRegion(e.target.value)} className="field">
          {regiones.map((r) => <option key={r} className="bg-surface">{r}</option>)}
        </select>
      </label>
      <label className="text-sm">Comuna<input name="comuna" required value={comuna} onChange={(e) => setComuna(e.target.value)} className="field" /></label>
      <label className="text-sm sm:col-span-2">Depto., casa u otra referencia (opcional)<input name="reference" placeholder="Depto. 402, torre B; portón verde" className="field" /></label>

      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />

      {coords && (
        <div className="sm:col-span-2">
          <div className="overflow-hidden rounded-2xl border">
            <iframe title="Mapa de la dirección de despacho" src={mapSrc} className="h-64 w-full" loading="lazy" />
          </div>
          <p className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
            <span>Confirma que el punto corresponde a tu dirección. Si no, corrige la calle y el número.</span>
            <a href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Abrir en mapa grande</a>
          </p>
        </div>
      )}
    </>
  );
}
