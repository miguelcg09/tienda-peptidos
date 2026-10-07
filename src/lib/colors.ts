// Colores derivados del color de cada producto (el de la tapa de su vial): el fondo de la portada,
// el tono claro de las tarjetas y el tono oscuro de la tapa. Todo plano, sin degradados.

const INK = "#0b0f10";
const WHITE = "#ffffff";

function parse(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full.slice(0, 6), 16);
  if (Number.isNaN(n)) return [37, 99, 235];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}

// Mezcla `a` con `b`; t = 0 deja `a`, t = 1 deja `b`.
export function mix(a: string, b: string, t: number) {
  const [ar, ag, ab] = parse(a);
  const [br, bg, bb] = parse(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
}

function luminance(hex: string) {
  const [r, g, b] = parse(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Texto que se lee sobre ese color: blanco o tinta, el de mayor contraste.
export function onColor(hex: string) {
  const l = luminance(hex);
  const white = 1.05 / (l + 0.05);
  const ink = (l + 0.05) / (luminance(INK) + 0.05);
  return white >= ink ? WHITE : INK;
}

// Contraste del mejor texto (blanco o tinta) sobre ese color.
function bestContrast(hex: string) {
  const l = luminance(hex);
  return Math.max(1.05 / (l + 0.05), (l + 0.05) / (luminance(INK) + 0.05));
}

// Fondo para texto: los colores de tono medio no llegan a 4,5:1 ni con blanco ni con tinta, así que se
// oscurecen lo justo. Con los colores de siempre no cambia nada; protege a los que se carguen desde /admin.
export function field(hex: string) {
  let c = hex;
  for (let i = 0; i < 14 && bestContrast(c) < 4.5; i++) c = mix(c, "#000000", 0.05);
  return c;
}

function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = parse(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function fromHsl(h: number, s: number, l: number) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}

// Fondo claro de las tarjetas: el mismo peso para todos los productos. Del color del producto solo se conserva el
// matiz; la luminosidad y la saturación son fijas (los grises se quedan grises), así la grilla se lee como una familia.
const soft = (hex: string, l: number) => {
  const [h, s] = toHsl(hex);
  return fromHsl(h, s < 0.12 ? s : 0.32, l);
};

export const deep = (hex: string) => mix(hex, "#000000", 0.42); // tapa sobre el color de la portada
export const tint = (hex: string) => soft(hex, 0.92); // fondo claro de las tarjetas
export const tintHover = (hex: string) => soft(hex, 0.87);
