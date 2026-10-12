"use client";

// Botón de formulario que pide confirmación antes de enviar: sirve para borrar o anular algo que no se
// puede deshacer (un toque equivocado en el celular no debe eliminar un producto o un pedido).
export function ConfirmButton({
  message,
  className,
  formAction,
  children,
}: {
  message: string;
  className?: string;
  formAction?: () => void | Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <button
      className={className}
      formAction={formAction}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
