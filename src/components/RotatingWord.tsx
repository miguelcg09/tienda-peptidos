"use client";

import { useEffect, useState } from "react";

// Palabra que cambia cada pocos segundos dentro del titular.
export function RotatingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [words.length]);
  return (
    <span className={`inline-grid overflow-hidden align-bottom ${className}`}>
      <span key={words[i]} className="animate-slide col-start-1 row-start-1">{words[i]}</span>
    </span>
  );
}
