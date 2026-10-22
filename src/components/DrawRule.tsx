"use client";

import { useEffect, useRef } from "react";

// Filete que se dibuja de izquierda a derecha al entrar en pantalla. Como Reveal: es visible por defecto y
// solo se oculta (con JavaScript, y solo si está bajo la pantalla) hasta que llega a la vista.
export function DrawRule({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.95) return;
    el.classList.add("draw-pending");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("draw-pending");
          io.disconnect();
        }
      },
      { threshold: 1 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      el.classList.remove("draw-pending");
    };
  }, []);

  return <span ref={ref} aria-hidden="true" className={`draw block ${className}`} />;
}
