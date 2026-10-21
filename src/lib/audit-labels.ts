// Nombres en español de las acciones del registro de auditoría (sin acceso a la base: se usa en páginas y descargas).

export const AUDIT_ACTIONS: Record<string, string> = {
  "ingreso": "Ingresó al panel",
  "ingreso.fallido": "Intento de ingreso fallido",
  "producto.crear": "Creó un producto",
  "producto.editar": "Editó un producto",
  "producto.visibilidad": "Mostró u ocultó un producto",
  "producto.borrar": "Borró un producto",
  "pedido.confirmar_pago": "Confirmó un pago por transferencia",
  "pedido.despachar": "Despachó un pedido",
  "pedido.nota": "Cambió la nota de un pedido",
  "pedido.anular": "Anuló o eliminó un pedido",
  "ajustes.guardar": "Cambió los ajustes",
  "ajustes.restaurar_textos": "Restauró los textos legales sugeridos",
  "cupon.guardar": "Creó o editó un cupón",
  "cupon.estado": "Activó o desactivó un cupón",
  "cupon.borrar": "Borró un cupón",
  "resena.estado": "Cambió el estado de una reseña",
  "resena.borrar": "Borró una reseña",
  "suscriptor.borrar": "Borró un suscriptor",
  "usuario.crear": "Creó una cuenta",
  "usuario.nombre": "Cambió el nombre de una cuenta",
  "usuario.reiniciar_clave": "Reinició la clave de una cuenta",
  "usuario.desactivar": "Desactivó una cuenta",
  "usuario.reactivar": "Reactivó una cuenta",
  "clave.cambiar": "Cambió su propia clave",
  "reporte.descargar": "Descargó un reporte",
};

// Grupos para el filtro de la pantalla (el prefijo antes del punto).
export const AUDIT_GROUPS: { key: string; label: string }[] = [
  { key: "producto", label: "Productos" },
  { key: "pedido", label: "Pedidos" },
  { key: "ajustes", label: "Ajustes" },
  { key: "cupon", label: "Cupones" },
  { key: "resena", label: "Reseñas" },
  { key: "suscriptor", label: "Suscriptores" },
  { key: "usuario", label: "Cuentas del equipo" },
  { key: "clave", label: "Cambios de clave" },
  { key: "ingreso", label: "Ingresos" },
  { key: "reporte", label: "Descargas de reportes" },
];

export const actionLabel = (action: string) => AUDIT_ACTIONS[action] ?? action;

// Nombres de los campos de Ajustes para el registro (y cuáles no se muestran con su valor).
export const SETTING_LABELS: Record<string, string> = {
  name: "Nombre de la tienda",
  tagline: "Frase de la tienda",
  email: "Correo de contacto",
  whatsapp: "WhatsApp",
  shippingCost: "Costo de envío",
  freeShippingFrom: "Envío gratis desde",
  shippingNote: "Línea de despacho",
  palette: "Paleta de colores",
  disclaimer: "Aviso de investigación",
  legalName: "Razón social",
  legalRut: "RUT del vendedor",
  legalAddress: "Domicilio del vendedor",
  legalUpdated: "Fecha de actualización legal",
  instagram: "Instagram",
  bankName: "Banco",
  bankAccountType: "Tipo de cuenta",
  bankAccount: "Número de cuenta",
  bankHolder: "Titular de la cuenta",
  bankRut: "RUT de la cuenta",
  bankEmail: "Correo de pagos",
  terminos: "Términos y condiciones",
  envios: "Envíos y devoluciones",
  privacidad: "Política de privacidad",
};
// Estos cambios se anotan sin mostrar el valor (datos bancarios y textos largos).
export const SETTING_HIDDEN = new Set(["bankName", "bankAccountType", "bankAccount", "bankHolder", "bankRut", "bankEmail", "terminos", "envios", "privacidad", "disclaimer"]);
