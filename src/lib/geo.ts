import "server-only";
import { findComuna, getRegion, plainText, regionesChile, type Region } from "./comunas";

// Búsqueda de direcciones (autocompletado, ubicación manual y geolocalización inversa)
// para el checkout. Usa Photon (OpenStreetMap, sin clave ni costo). Con GEO_PROVIDER=mock
// devuelve resultados fijos, útil para probar sin red.
//
// En Chile OpenStreetMap tiene pocos números de casa, así que la búsqueda se hace en
// dos capas: números exactos ("house") y calles ("street"). Si solo aparece la calle,
// se conserva el número que escribió el cliente y el punto queda marcado como
// aproximado (approx) para que lo ajuste en el mapa. La comuna nunca se inventa: solo
// se completa si el resultado coincide con una comuna oficial (src/lib/comunas.ts).

export type Place = {
  label: string; // "Los Leones 45, Providencia, Metropolitana"
  address: string; // calle y número
  comuna: string; // comuna oficial o "" si no se pudo determinar
  region: string; // nombre corto, como en el selector del checkout
  lat: number;
  lng: number;
  approx?: boolean; // el punto no es exacto (calle o comuna): hay que ajustarlo en el mapa
  level?: "house" | "street" | "comuna" | "region"; // qué tan preciso es el punto
};

export type Context = { comuna?: string; region?: string };

// "Av. Los Leones 45", "Los Leones #45", "Los Leones N° 45" → calle "Av. Los Leones", número "45"
export function splitNumber(q: string): { street: string; number: string } {
  const m = q.trim().match(/^(.+?)[\s,]*(?:#|n[°º]?\.?\s*|nro\.?\s*|n[uú]mero\s*)?\s*(\d{1,6}(?:\s?[a-z])?)\s*$/i);
  if (!m || m[1].trim().length < 3) return { street: q.trim(), number: "" };
  return { street: m[1].trim().replace(/[,\s]+$/, ""), number: m[2].replace(/\s+/g, "").toUpperCase() };
}

type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string; street?: string; housenumber?: string; district?: string; city?: string; county?: string;
    locality?: string; state?: string; countrycode?: string; osm_key?: string; osm_value?: string;
  };
};

// Comuna oficial a partir de los campos de OpenStreetMap. En Santiago, "city" suele ser
// "Santiago" y la comuna viene en "district"; en regiones la comuna viene en "city".
function comunaOf(p: PhotonFeature["properties"], ctx: Context) {
  const regionHint = ctx.region ?? shortRegion(p.state);
  for (const candidate of [p.district, p.city, p.locality, p.county, p.name]) {
    const found = findComuna(candidate, regionHint);
    if (found) return found;
  }
  return null;
}

function shortRegion(name: string | undefined) {
  if (!name) return "";
  const n = plainText(name);
  const keys: [string, string][] = [
    ["arica", "Arica y Parinacota"], ["tarapac", "Tarapacá"], ["antofagasta", "Antofagasta"], ["atacama", "Atacama"],
    ["coquimbo", "Coquimbo"], ["valpara", "Valparaíso"], ["metropolitana", "Metropolitana"], ["santiago", "Metropolitana"],
    ["higgins", "O'Higgins"], ["maule", "Maule"], ["nuble", "Ñuble"], ["biob", "Biobío"], ["araucan", "La Araucanía"],
    ["los rios", "Los Ríos"], ["los lagos", "Los Lagos"], ["ays", "Aysén"], ["magallanes", "Magallanes"],
  ];
  return keys.find(([k]) => n.includes(k))?.[1] ?? "";
}

function place(address: string, f: PhotonFeature, level: Place["level"], ctx: Context): Place {
  const c = comunaOf(f.properties, ctx);
  const comuna = c?.comuna ?? "";
  const region = c?.region ?? shortRegion(f.properties.state);
  const approx = level !== "house";
  return {
    label: [address, comuna, region].filter(Boolean).join(", "),
    address,
    comuna,
    region,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
    level,
    ...(approx ? { approx: true } : {}),
  };
}

const isChile = (p: PhotonFeature["properties"]) => !p.countrycode || p.countrycode.toUpperCase() === "CL";

// Dirección con número verificada en el mapa.
function houseFrom(f: PhotonFeature, ctx: Context): Place | null {
  const p = f.properties;
  if (!isChile(p) || !p.housenumber) return null;
  const street = p.street ?? p.name;
  return street ? place(`${street} ${p.housenumber}`, f, "house", ctx) : null;
}

// Calle sin número en el mapa: se le agrega el número escrito por el cliente.
function streetFrom(f: PhotonFeature, number: string, ctx: Context): Place | null {
  const p = f.properties;
  if (!isChile(p)) return null;
  const street = p.osm_key === "highway" ? p.name ?? p.street : p.street;
  return street ? place(number ? `${street} ${number}` : street, f, "street", ctx) : null;
}

// Si el cliente eligió comuna, se descartan resultados de otra comuna conocida.
// La región solo orienta la búsqueda: no filtra, porque el selector parte en Metropolitana.
function inContext(p: Place, ctx: Context) {
  return !(ctx.comuna && p.comuna && plainText(p.comuna) !== plainText(ctx.comuna));
}

const headers = { "User-Agent": "tienda-peptidos/1.0 (checkout)" };
const base = "https://photon.komoot.io";

async function photon(path: string, params: Record<string, string>, layers: string[], cache: RequestInit): Promise<PhotonFeature[]> {
  if (process.env.GEO_PROVIDER === "mock") return mockPhoton(path, params, layers);
  const qs = new URLSearchParams(params);
  for (const l of layers) qs.append("layer", l);
  const res = await fetch(`${base}${path}?${qs}`, { headers, ...cache });
  if (!res.ok) throw new Error(`Photon respondió ${res.status}`);
  const data = (await res.json()) as { features?: PhotonFeature[] };
  return data.features ?? [];
}

// Solo Chile, con sesgo hacia la región elegida (o Santiago); sin "lang" porque el nombre local ya es el español.
function bias(ctx: Context) {
  const r: Region = getRegion(ctx.region) ?? regionesChile[6];
  return { countrycode: "CL", lat: String(r.lat), lon: String(r.lng), zoom: ctx.region ? "10" : "12" };
}

const cache: RequestInit = { next: { revalidate: 86400 } };

export async function searchPlaces(q: string, ctx: Context = {}): Promise<Place[]> {
  const { street, number } = splitNumber(q);
  const where = ctx.comuna ? `, ${ctx.comuna}` : "";
  const [houses, streets] = await Promise.all([
    number ? photon("/api", { q: `${q}${where}`, limit: "8", ...bias(ctx) }, ["house"], cache) : Promise.resolve([] as PhotonFeature[]),
    photon("/api", { q: `${street}${where}`, limit: "8", ...bias(ctx) }, ["street"], cache),
  ]);

  const exact = houses.map((f) => houseFrom(f, ctx)).filter((p): p is Place => Boolean(p));
  // Primero los números que coinciden con el escrito, luego el resto de esa calle.
  const matches = (p: Place) => Number(p.address.toUpperCase().endsWith(` ${number}`));
  exact.sort((a, b) => matches(b) - matches(a));
  const approx = streets.map((f) => streetFrom(f, number, ctx)).filter((p): p is Place => Boolean(p));

  const seen = new Set<string>();
  return [...exact, ...approx]
    .filter((p) => inContext(p, ctx))
    .filter((p) => !seen.has(plainText(p.label)) && Boolean(seen.add(plainText(p.label))))
    .slice(0, 6);
}

// Punto de referencia de una comuna (o de la región si la comuna no aparece).
async function comunaCenter(ctx: Context): Promise<Place | null> {
  const region = getRegion(ctx.region);
  if (ctx.comuna) {
    const feats = await photon("/api", { q: `${ctx.comuna}${region ? `, ${region.name}` : ""}`, limit: "3", ...bias(ctx) }, ["city", "district", "locality", "county"], cache);
    const f = feats.find((x) => isChile(x.properties) && findComuna(x.properties.name, ctx.region));
    if (f) return { label: `${ctx.comuna}${region ? `, ${region.name}` : ""}`, address: "", comuna: ctx.comuna, region: region?.name ?? "", lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0], approx: true, level: "comuna" };
  }
  if (region) return { label: region.name, address: "", comuna: ctx.comuna ?? "", region: region.name, lat: region.lat, lng: region.lng, approx: true, level: "region" };
  return null;
}

// Ubicación manual: el cliente escribió la dirección y eligió comuna, sin tomar una sugerencia.
// Devuelve el mejor punto posible (número, calle, comuna o región) para que lo ajuste en el mapa.
export async function locateAddress(q: string, ctx: Context): Promise<Place | null> {
  const found = q.trim().length >= 3 ? await searchPlaces(q, ctx) : [];
  const best = found.find((p) => p.level === "house") ?? found[0];
  if (best) return { ...best, comuna: ctx.comuna || best.comuna, address: q.trim() || best.address };
  return comunaCenter(ctx);
}

export async function reversePlace(lat: number, lng: number): Promise<Place | null> {
  const feats = await photon("/reverse", { lat: String(lat), lon: String(lng), limit: "1" }, [], { cache: "no-store" });
  const f = feats[0];
  if (!f) return null;
  const p = houseFrom(f, {}) ?? streetFrom(f, "", {});
  return p ? { ...p, lat, lng } : null;
}

// ---- Datos fijos para pruebas sin red (GEO_PROVIDER=mock) ----
const rm = { state: "Región Metropolitana de Santiago", countrycode: "CL" };
const mockHouses: PhotonFeature[] = [
  { geometry: { coordinates: [-70.6045, -33.4218] }, properties: { street: "Los Leones", housenumber: "45", district: "Barrio El Golf", city: "Providencia", osm_key: "place", osm_value: "house", ...rm } },
  { geometry: { coordinates: [-70.6055, -33.4262] }, properties: { street: "Los Leones", housenumber: "450", district: "Providencia", city: "Santiago", osm_key: "building", osm_value: "yes", ...rm } },
];
const mockStreets: PhotonFeature[] = [
  { geometry: { coordinates: [-70.605, -33.424] }, properties: { name: "Los Leones", city: "Providencia", osm_key: "highway", osm_value: "residential", ...rm } },
  { geometry: { coordinates: [-71.5502, -33.0153] }, properties: { name: "Avenida Los Leones", city: "Viña del Mar", osm_key: "highway", osm_value: "primary", state: "Región de Valparaíso", countrycode: "CL" } },
  { geometry: { coordinates: [-70.5769, -33.4137] }, properties: { name: "Avenida Apoquindo", district: "Las Condes", city: "Santiago", osm_key: "highway", osm_value: "primary", ...rm } },
  { geometry: { coordinates: [-70.62, -33.44] }, properties: { name: "Calle Sin Comuna", osm_key: "highway", osm_value: "residential", ...rm } },
];
const mockCities: PhotonFeature[] = [
  { geometry: { coordinates: [-70.61, -33.43] }, properties: { name: "Providencia", osm_key: "boundary", osm_value: "administrative", ...rm } },
  { geometry: { coordinates: [-70.58, -33.41] }, properties: { name: "Las Condes", osm_key: "boundary", osm_value: "administrative", ...rm } },
  { geometry: { coordinates: [-71.55, -33.02] }, properties: { name: "Viña del Mar", osm_key: "place", osm_value: "city", state: "Región de Valparaíso", countrycode: "CL" } },
];

function mockPhoton(path: string, params: Record<string, string>, layers: string[]): PhotonFeature[] {
  if (path === "/reverse") return [mockHouses[0]];
  const q = plainText((params.q ?? "").split(",")[0]);
  const pool = layers.includes("house") ? mockHouses : layers.includes("street") ? mockStreets : mockCities;
  return pool.filter((f) => {
    const name = plainText(`${f.properties.street ?? f.properties.name ?? ""} ${f.properties.housenumber ?? ""}`).trim();
    const street = plainText(f.properties.name ?? f.properties.street ?? "").replace(/^avenida /, "");
    return name.includes(q) || q.includes(street);
  });
}
