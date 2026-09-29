"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

// Mapa (OpenStreetMap con Leaflet) con un marcador que el cliente puede arrastrar
// hasta su puerta. También se puede tocar el mapa para mover el marcador.
export function MapPicker({ lat, lng, onMove }: { lat: number; lng: number; onMove: (lat: number, lng: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const fromMap = useRef(false); // el último cambio vino del propio mapa: no recentrar
  const move = useRef(onMove);
  move.current = onMove;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current) return;
      if (!map.current) {
        const m = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView([lat, lng], 17);
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        }).addTo(m);
        const icon = L.divIcon({ className: "map-pin", html: "<span></span>", iconSize: [30, 40], iconAnchor: [15, 40] });
        const mk = L.marker([lat, lng], { draggable: true, icon, title: "Arrastra el marcador hasta tu dirección" }).addTo(m);
        const report = () => {
          const p = mk.getLatLng();
          fromMap.current = true;
          move.current(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
        };
        mk.on("dragend", report);
        m.on("click", (e) => { mk.setLatLng(e.latlng); report(); });
        map.current = m;
        marker.current = mk;
      } else if (fromMap.current) {
        fromMap.current = false;
      } else {
        marker.current!.setLatLng([lat, lng]);
        map.current.setView([lat, lng], 17);
      }
    })();
    return () => { cancelled = true; };
  }, [lat, lng]);

  useEffect(() => () => { map.current?.remove(); map.current = null; marker.current = null; }, []);

  return <div ref={el} data-testid="mapa" className="h-72 w-full bg-surface-2" />;
}
