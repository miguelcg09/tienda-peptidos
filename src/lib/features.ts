// Certificados y pureza: ocultos mientras no existan documentos reales que los respalden (decisión del
// 2026-10-06). Para volver a mostrarlos en fichas, guías y buscadores, poner SHOW_CERTIFICATES=1 en las
// variables de entorno. Una ficha con un certificado cargado (coaUrl) siempre muestra su certificado.
export const showCertificates = () => process.env.SHOW_CERTIFICATES === "1";
