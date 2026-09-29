"use client";

import { usePathname } from "next/navigation";
import { useStore } from "./CartProvider";
import { whatsappLink } from "@/lib/whatsapp";

// Botón flotante de WhatsApp con el número de Ajustes (no aparece en el panel ni si no hay número).
export function WhatsAppButton() {
  const { settings } = useStore();
  const path = usePathname();
  const href = whatsappLink(settings.whatsapp, `Hola ${settings.name}, tengo una consulta.`);
  if (!href || path.startsWith("/admin")) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
      className="fixed bottom-5 left-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 print:hidden"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 1.8a8.2 8.2 0 1 1-4.2 15.3l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 0 1 12 3.8Zm-3.1 4.4c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.2 5 4.4 2.5 1 3 .8 3.5.7.5 0 1.7-.7 2-1.4.2-.7.2-1.2.1-1.4l-.5-.3-1.9-.9c-.3-.1-.5-.2-.7.2l-.9 1.1c-.2.2-.3.2-.6.1a6.8 6.8 0 0 1-3.4-3c-.3-.4 0-.6.2-.8l.4-.5.3-.5V11l-.8-2.1c-.2-.5-.4-.5-.6-.5h-.6Z" />
      </svg>
    </a>
  );
}
