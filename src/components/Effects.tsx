"use client";

import { useEffect } from "react";

// Efectos globales sin librerías:
// - botones principales "magnéticos" (se acercan al cursor) y con onda al hacer clic;
// - luz que sigue al cursor en las secciones marcadas con data-spot.
export function Effects() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let magnet: HTMLElement | null = null;

    const reset = () => {
      if (!magnet) return;
      magnet.style.setProperty("--mag-x", "0px");
      magnet.style.setProperty("--mag-y", "0px");
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      const target = e.target as Element | null;
      const btn = target?.closest?.(".btn-primary") as HTMLElement | null;
      if (btn !== magnet) reset();
      if (btn && !(btn as HTMLButtonElement).disabled) {
        magnet = btn;
        const r = btn.getBoundingClientRect();
        const dx = ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 5;
        const dy = ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 4;
        btn.style.setProperty("--mag-x", `${dx.toFixed(1)}px`);
        btn.style.setProperty("--mag-y", `${dy.toFixed(1)}px`);
      }
      const spot = target?.closest?.("[data-spot]") as HTMLElement | null;
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--hx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--hy", `${e.clientY - r.top}px`);
      }
    };

    const onClick = (e: MouseEvent) => {
      const btn = (e.target as Element | null)?.closest?.(".btn-primary") as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2;
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      btn.appendChild(dot);
      setTimeout(() => dot.remove(), 650);
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("pointermove", onMove); document.removeEventListener("click", onClick); reset(); };
  }, []);
  return null;
}
