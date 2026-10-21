// Validaciones del servidor compartidas por las rutas públicas: los datos llegan de internet, así que
// se comprueba el tipo y el largo antes de usarlos (un número o un objeto donde se espera texto no debe
// tumbar la ruta con un error 500).

export const isEmail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

// Teléfono con 8 a 15 dígitos; se aceptan +, espacios, guiones y paréntesis.
export const isPhone = (s: string) => {
  const digits = s.replace(/\D/g, "");
  return /^[\d\s+()-]+$/.test(s) && digits.length >= 8 && digits.length <= 15;
};

// Texto recortado de espacios; null si no es texto o supera el largo máximo.
export function text(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length <= max ? t : null;
}

export const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

// Nombre de pantalla de una persona del equipo: 2 a 60 caracteres, sin saltos de línea.
export function personName(v: unknown) {
  const s = text(v, 60);
  return s && s.length >= 2 && !/[\r\n\t<>]/.test(s) ? s : null;
}
