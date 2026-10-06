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

export const deep = (hex: string) => mix(hex, "#000000", 0.42); // tapa sobre el color de la portada
export const tint = (hex: string) => mix(hex, WHITE, 0.84); // fondo claro de las tarjetas
export const tintHover = (hex: string) => mix(hex, WHITE, 0.75);
