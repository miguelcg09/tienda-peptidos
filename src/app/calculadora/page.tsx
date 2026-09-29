import type { Metadata } from "next";
import { Calculadora } from "@/components/Calculadora";

export const metadata: Metadata = {
  title: "Calculadora de reconstitución",
  description: "Calcula la concentración de un vial liofilizado y el volumen de una alícuota de laboratorio según los mg y el diluyente.",
  alternates: { canonical: "/calculadora" },
};

export default function Page() {
  return (
    <div className="animate-fade mx-auto max-w-3xl px-4 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Herramienta</p>
      <h1 className="sweep mt-2 font-display text-4xl font-bold">Calculadora de reconstitución</h1>
      <p className="mt-4 text-muted">
        Indica los miligramos del vial y cuánto diluyente agregas: te decimos la concentración resultante y el volumen que corresponde a la cantidad de muestra que necesitas medir.
      </p>
      <Calculadora />
    </div>
  );
}
