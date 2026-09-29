// Enlaces de WhatsApp a partir del número escrito en Ajustes (sirve en cliente y servidor).
export function whatsappDigits(raw: string) {
  const digits = raw.replace(/\D/g, "");
  const local = digits.replace(/^56/, "").replace(/^9/, "");
  if (digits.length < 9 || /^0*$/.test(local)) return ""; // vacío o el número de ejemplo
  return digits;
}

export function whatsappLink(raw: string, text?: string) {
  const digits = whatsappDigits(raw);
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
