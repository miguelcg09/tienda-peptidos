// Archivos CSV pensados para abrirse con doble clic en Excel de un computador en español: separador «;», acentos
// bien escritos (marca UTF-8 al inicio) y saltos de línea de Windows.

export type Cell = string | number | null | undefined;

// Una celda que empieza con = + - @ (o tabulación / retorno) la interpreta Excel como fórmula: un nombre de cliente
// como «=HYPERLINK(...)» podría ejecutar algo al abrir el archivo. Se antepone un apóstrofo para que sea solo texto.
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(v: Cell, delimiter = ";") {
  if (v == null) return "";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  let s = String(v);
  if (FORMULA_START.test(s)) s = `'${s}`;
  return /["\r\n]/.test(s) || s.includes(delimiter) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: Cell[][], delimiter = ";") {
  return `﻿${rows.map((r) => r.map((c) => csvCell(c, delimiter)).join(delimiter)).join("\r\n")}\r\n`;
}

export function csvResponse(body: string, filename: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename.replace(/[^\w.-]+/g, "_")}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
