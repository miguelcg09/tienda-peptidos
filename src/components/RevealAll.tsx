"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Aparición al hacer scroll para todo lo marcado con data-reveal. Lo que ya está a la vista no se toca, y
// dentro de una grilla cada pieza llega un poco después que la anterior (data-reveal="N" = su posición).
// Sin JavaScript, o con "menos movimiento", todo se ve desde el comienzo.
export function RevealAll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]")].filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.92);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.remove("reveal-pending");
          io.unobserve(el);
          // El retraso solo sirve para la entrada: después el hover responde al instante
          setTimeout(() => { el.style.transitionDelay = ""; }, 1000);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    for (const el of els) {
      const n = Number(el.dataset.reveal) || 0;
      el.style.transitionDelay = `${(n % 3) * 90}ms`;
      el.classList.add("reveal-pending");
      io.observe(el);
    }
    return () => { io.disconnect(); els.forEach((el) => el.classList.remove("reveal-pending")); };
  }, [pathname]);
  return null;
}
