"use client";

import Link from "next/link";
import { Icon } from "@/components/Icon";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <span aria-hidden="true" className="animate-float mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-surface-2 text-accent-2"><Icon name="info" size={36} /></span>
      <h1 className="t-page">Algo salió mal</h1>
      <p className="mt-3 text-muted">No pudimos cargar esta página. Puedes intentarlo de nuevo y, si sigue igual, escríbenos y lo resolvemos.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">Reintentar</button>
        <Link href="/" className="btn-ghost">Volver al inicio</Link>
      </div>
    </section>
  );
}
