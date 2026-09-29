import "server-only";

// Búsqueda de direcciones (autocompletado y geolocalización inversa) para el checkout.
// Usa Photon (OpenStreetMap, sin clave ni costo). Con GEO_PROVIDER=mock devuelve
// resultados fijos, útil para probar sin red.

export type Place = {
  label: string; // "Los Leones 45, Providencia, Metropolitana"
  address: string; // calle y número
  comuna: string;
  region: string; // nombre corto, como en el selector del checkout
  lat: number;
  lng: number;
};

const regiones: [string, string][] = [
  ["arica", "Arica y Parinacota"], ["tarapac", "Tarapacá"], ["antofagasta", "Antofagasta"], ["atacama", "Atacama"],
  ["coquimbo", "Coquimbo"], ["valpara", "Valparaíso"], ["metropolitana", "Metropolitana"], ["santiago", "Metropolitana"],
  ["higgins", "O'Higgins"], ["maule", "Maule"], ["nuble", "Ñuble"], ["biob", "Biobío"], ["araucan", "La Araucanía"],
  ["los rios", "Los Ríos"], ["los lagos", "Los Lagos"], ["ays", "Aysén"], ["magallanes", "Magallanes"],
];

const plain = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function shortRegion(name: string | undefined) {
  if (!name) return "";
  const n = plain(name);
  return regiones.find(([k]) => n.includes(k))?.[1] ?? name.replace(/^Regi[oó]n (de |del |de la )?/i, "");
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string; street?: string; housenumber?: string; district?: string; city?: string; county?: string;
    locality?: string; state?: string; countrycode?: string; osm_key?: string; osm_value?: string;
  };
};

function fromPhoton(f: PhotonFeature): Place | null {
  const p = f.properties;
  if (p.countrycode && p.countrycode.toUpperCase() !== "CL") return null;
  // Solo calles y direcciones con número; se descartan ciudades, regiones y lugares sin dirección.
  const isStreet = p.osm_key === "highway";
  if (!isStreet && !p.street && !p.housenumber) return null;
  const street = p.street ?? p.name ?? "";
  const address = [street, p.housenumber].filter(Boolean).join(" ").trim();
  const comuna = (p.district ?? p.city ?? p.locality ?? p.county ?? "").replace(/^Provincia de /i, "");
  const region = shortRegion(p.state);
  if (!address) return null;
  return {
    label: [address, comuna, region].filter(Boolean).join(", "),
    address,
    comuna,
    region,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  };
}

const mockPlaces: Place[] = [
  { label: "Los Leones 45, Providencia, Metropolitana", address: "Los Leones 45", comuna: "Providencia", region: "Metropolitana", lat: -33.4218, lng: -70.6045 },
  { label: "Los Leones 450, Providencia, Metropolitana", address: "Los Leones 450", comuna: "Providencia", region: "Metropolitana", lat: -33.4262, lng: -70.6055 },
  { label: "Avenida Los Leones 12, Viña del Mar, Valparaíso", address: "Avenida Los Leones 12", comuna: "Viña del Mar", region: "Valparaíso", lat: -33.0153, lng: -71.5502 },
];

const headers = { "User-Agent": "tienda-peptidos/1.0 (checkout)" };

export async function searchPlaces(q: string): Promise<Place[]> {
  if (process.env.GEO_PROVIDER === "mock") return mockPlaces.filter((p) => plain(p.label).includes(plain(q).slice(0, 3)));
  // Sesgo hacia Santiago para que las calles chilenas aparezcan primero.
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lat=-33.45&lon=-70.66`;
  const res = await fetch(url, { headers, next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Photon respondió ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  const seen = new Set<string>();
  return data.features
    .map(fromPhoton)
    .filter((p): p is Place => Boolean(p) && !seen.has(p!.label) && Boolean(seen.add(p!.label)))
    .slice(0, 6);
}

export async function reversePlace(lat: number, lng: number): Promise<Place | null> {
  if (process.env.GEO_PROVIDER === "mock") return { ...mockPlaces[0], lat, lng };
  const url = `https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}&limit=1`;
  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) throw new Error(`Photon respondió ${res.status}`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  const place = data.features.map(fromPhoton).find(Boolean) ?? null;
  return place ? { ...place, lat, lng } : null;
}
