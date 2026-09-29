// Valores por defecto de la tienda. Los reales se editan en /admin/ajustes y se guardan en la base de datos.
import { enviosDefault, legalUpdatedDefault, privacidadDefault, terminosDefault } from "./legal";

export type Settings = {
  name: string;
  tagline: string;
  email: string;
  whatsapp: string;
  shippingCost: number; // CLP
  freeShippingFrom: number; // CLP
  shippingNote: string; // línea de despacho en la ficha (plazos, couriers)
  palette: string; // id de la paleta de colores (ver src/lib/palettes.ts)
  disclaimer: string;
  legalName: string; // razón social o nombre del vendedor (aparece en los textos legales y el pie)
  legalRut: string;
  legalAddress: string;
  legalUpdated: string; // fecha de vigencia que muestran los documentos legales
  terminos: string; // texto plano; las líneas en blanco separan párrafos, "## " inicia un título, "- " una lista
  envios: string; // política de envíos y devoluciones, mismo formato
  privacidad: string; // política de privacidad, mismo formato
};

// Lo que reciben los componentes de cliente: sin los textos legales largos (se ven en sus páginas).
export type StoreSettings = Omit<Settings, "terminos" | "envios" | "privacidad">;
export const toStoreSettings = ({ terminos: _t, envios: _e, privacidad: _p, ...rest }: Settings): StoreSettings => rest;

export const defaultSettings: Settings = {
  name: "Helix Research",
  tagline: "Péptidos de grado investigación en Chile",
  email: "contacto@ejemplo.cl",
  whatsapp: "+56 9 0000 0000",
  shippingCost: 4990,
  freeShippingFrom: 80000,
  shippingNote: "Despachamos el mismo día hábil si compras antes de las 16:00 · Envío con seguimiento a todo Chile",
  palette: "ambar",
  disclaimer:
    "Todos los productos se venden exclusivamente para investigación in vitro y uso de laboratorio. No aptos para consumo humano o animal, ni para uso diagnóstico o terapéutico.",
  legalName: "",
  legalRut: "",
  legalAddress: "",
  legalUpdated: legalUpdatedDefault,
  terminos: terminosDefault,
  envios: enviosDefault,
  privacidad: privacidadDefault,
};

// Compatibilidad con código antiguo: usar getSettings() en el servidor o useStore().settings en el cliente.
export const store = defaultSettings;
export const RESEARCH_DISCLAIMER = defaultSettings.disclaimer;
