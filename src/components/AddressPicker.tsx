"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getRegion, regiones } from "@/lib/comunas";

const MapPicker = dynamic(() => import("./MapPicker").then((m) => m.MapPicker), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse bg-surface-2" />,
});

type Level = "house" | "street" | "comuna" | "region";
type Place = { label: string; address: string; comuna: string; region: string; lat: number; lng: number; approx?: boolean; level?: Level };
type Coords = { lat: number; lng: number; source: "sugerencia" | "manual" | "gps" | "mapa"; level: Level | "gps" | "mapa" };

// Dirección de despacho: región y comuna se eligen de la lista oficial; la dirección se escribe
// con sugerencias mientras se teclea, pero no dependen de ellas: al terminar de escribir se ubica
// sola en el mapa y el cliente puede arrastrar el marcador hasta su puerta. También hay GPS.
export function AddressPicker() {
  const [region, setRegion] = useState("Metropolitana");
  const [comuna, setComuna] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<Coords | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<"buscar" | "ubicar" | "gps" | null>(null);
  const [hint, setHint] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const chosen = useRef(""); // último texto elegido de una sugerencia (no se vuelve a buscar)
  const located = useRef(""); // última dirección+comuna ubicada a mano (no se repite)
  const inputRef = useRef<HTMLInputElement>(null);
  const comunas = getRegion(region)?.comunas ?? [];

  const ctx = () => `&region=${encodeURIComponent(region)}${comuna ? `&comuna=${encodeURIComponent(comuna)}` : ""}`;

  // Busca sugerencias 350 ms después de la última tecla.
  useEffect(() => {
    clearTimeout(timer.current);
    const q = address.trim();
    if (q.length < 4 || q === chosen.current) { setPlaces([]); return; }
    timer.current = setTimeout(async () => {
      setBusy("buscar");
      try {
        const r = await fetch(`/api/geo?q=${encodeURIComponent(q)}${ctx()}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, comuna, region]);

  function applyPlace(p: Place) {
    if (p.region && regiones.includes(p.region)) setRegion(p.region);
    if (p.comuna) setComuna(p.comuna);
  }

  function pick(p: Place) {
    chosen.current = p.address;
    setAddress(p.address);
    applyPlace(p);
    // Una sugerencia aproximada (solo la calle) no reemplaza un punto ya afinado con GPS o en el mapa.
    const keep = p.approx && coords && (coords.source === "gps" || coords.source === "mapa");
    if (!keep) setCoords({ lat: p.lat, lng: p.lng, source: "sugerencia", level: p.level ?? (p.approx ? "street" : "house") });
    setPlaces([]);
    setOpen(false);
    setHint("");
  }

  // Ubicación manual: sin elegir sugerencia, con lo escrito más la comuna.
  async function locate(force = false) {
    const q = address.trim();
    const key = `${q}|${comuna}|${region}`;
    if (!q || (!force && (q === chosen.current || key === located.current))) return;
    if (coords && (coords.source === "gps" || coords.source === "mapa") && !force) return;
    located.current = key;
    setBusy("ubicar");
    try {
      const r = await fetch(`/api/geo?locate=1&q=${encodeURIComponent(q)}${ctx()}`);
      const data = (await r.json()) as { place: Place | null };
      if (data.place) {
        const level = data.place.level ?? "street";
        if (!comuna && data.place.comuna) applyPlace(data.place);
        setCoords({ lat: data.place.lat, lng: data.place.lng, source: "manual", level });
        setHint("");
      } else {
        setHint("No pudimos ubicar la dirección. Elige tu comuna y vuelve a intentarlo.");
      }
    } catch {
      setHint("El servicio de mapas no respondió. Puedes continuar sin el mapa.");
    } finally {
      setBusy(null);
    }
  }

  function onType(value: string) {
    setAddress(value);
    // Si cambia la calle elegida se pierde el punto; agregar el número a la misma calle lo conserva.
    if (coords && coords.source !== "gps" && coords.source !== "mapa") {
      const stem = (chosen.current || address).toLowerCase().replace(/\s+\d+\w*$/, "").trim();
      if (!stem || !value.trim().toLowerCase().startsWith(stem)) setCoords(null);
    }
  }

  function onComuna(value: string) {
    setComuna(value);
    if (coords && (coords.source === "sugerencia" || coords.source === "manual")) setCoords(null);
    located.current = "";
  }

  function gps() {
    if (!navigator.geolocation) return setHint("Tu navegador no permite obtener la ubicación.");
    setBusy("gps");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        try {
          const r = await fetch(`/api/geo?lat=${c.latitude}&lng=${c.longitude}`);
          const data = (await r.json()) as { place: Place | null };
          if (data.place) {
            chosen.current = data.place.address;
            setAddress(data.place.address);
            applyPlace(data.place);
            setHint(data.place.level === "house" ? "" : "Ubicamos tu calle. Agrega el número a la dirección.");
          } else {
            setHint("Marcamos tu ubicación en el mapa, pero no encontramos la calle: escríbela tú.");
          }
          setCoords({ lat: c.latitude, lng: c.longitude, source: "gps", level: "gps" });
          setPlaces([]);
        } finally {
          setBusy(null);
        }
      },
      () => { setBusy(null); setHint("No pudimos obtener tu ubicación. Escribe la dirección."); },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  const note = !coords
    ? ""
    : coords.source === "mapa"
      ? "Punto ajustado a mano. Así lo recibirá el courier."
      : coords.source === "gps"
        ? "Punto de tu GPS. Si no coincide con tu puerta, arrastra el marcador."
        : coords.level === "house"
          ? "Si el marcador no coincide con tu puerta, arrástralo o toca el mapa."
          : coords.level === "street"
            ? "El número no aparece en el mapa: el marcador está sobre la calle. Arrástralo hasta tu dirección exacta."
            : "No encontramos la calle en el mapa: el marcador está en el centro de la comuna. Arrástralo hasta tu dirección o usa tu ubicación.";

  return (
    <>
      <label className="text-sm">Región
        <select name="region" required value={region} onChange={(e) => { setRegion(e.target.value); onComuna(""); }} className="field">
          {regiones.map((r) => <option key={r} className="bg-surface">{r}</option>)}
        </select>
      </label>
      <label className="text-sm">Comuna
        <select name="comuna" required value={comuna} onChange={(e) => onComuna(e.target.value)} className="field">
          <option value="" className="bg-surface">Elige tu comuna</option>
          {comunas.map((c) => <option key={c} className="bg-surface">{c}</option>)}
        </select>
      </label>

      <div className="relative text-sm sm:col-span-2">
        <label>
          Dirección (calle y número)
          <input
            ref={inputRef}
            name="address"
            required
            autoComplete="off"
            value={address}
            onChange={(e) => onType(e.target.value)}
            onFocus={() => places.length && setOpen(true)}
            onBlur={() => { setTimeout(() => setOpen(false), 150); if (!coords) void locate(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (places[0] && open) pick(places[0]); else void locate(true); } }}
            placeholder="Por ejemplo Los Leones 45"
            className="field"
          />
        </label>
        {busy === "buscar" && <span className="absolute right-3 top-9 text-xs text-muted">Buscando…</span>}
        {open && places.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-card border bg-surface shadow-xl">
            {places.map((p) => (
              <li key={p.label}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick(p)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-accent/10">
                  <span className="mt-0.5 text-accent">📍</span>
                  <span>
                    <span className="block font-medium">{p.address}</span>
                    <span className="block text-xs text-muted">
                      {[p.comuna, p.region].filter(Boolean).join(", ") || "Comuna por confirmar"}
                      {p.approx && " · el número lo ajustas en el mapa"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
          <button type="button" onClick={() => void locate(true)} disabled={busy === "ubicar" || !address.trim()} className="rounded-btn border px-3 py-1 text-fg transition hover:border-accent disabled:opacity-50">
            {busy === "ubicar" ? "Ubicando…" : "🗺️ Ver en el mapa"}
          </button>
          <button type="button" onClick={gps} disabled={busy === "gps"} className="rounded-btn border px-3 py-1 text-fg transition hover:border-accent">
            {busy === "gps" ? "Ubicando…" : "📡 Usar mi ubicación"}
          </button>
          <span>Escribe tu dirección y elige tu comuna; el mapa se ubica solo y puedes ajustar el marcador.</span>
        </div>
        {hint && <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">{hint}</p>}
      </div>

      <label className="text-sm sm:col-span-2">Depto., casa u otra referencia (opcional)<input name="reference" placeholder="Depto. 402, torre B; portón verde" className="field" /></label>

      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />

      {coords && (
        <div className="sm:col-span-2">
          <div className="relative isolate z-0 overflow-hidden rounded-card border">
            <MapPicker lat={coords.lat} lng={coords.lng} onMove={(lat, lng) => setCoords({ lat, lng, source: "mapa", level: "mapa" })} />
          </div>
          <p className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted">
            <span data-testid="mapa-nota">{note}</span>
            <a href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`} target="_blank" rel="noreferrer" className="text-accent hover:underline">Abrir en Google Maps</a>
          </p>
        </div>
      )}
    </>
  );
}
