// client/src/components/ui/alert-dialog.jsx
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

export function AlertDialog({ open, onOpenChange, children }) {
  // Efeito de travar o scroll (movido do Dialog para cá)
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      // Fundo com blur e animação de fade-in
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0"
      onClick={() => onOpenChange(false)}
    >
      <div
        // Sombra, cantos arredondados e animação de zoom
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in-0 zoom-in-90"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

// Conteúdo principal com espaçamento interno
export function AlertDialogContent({ children }) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

// Header é apenas um container
export function AlertDialogHeader({ children }) {
  return <div>{children}</div>;
}

// Título com fonte mais suave
export function AlertDialogTitle({ children }) {
  return <h2 className="text-lg font-semibold text-gray-900">{children}</h2>;
}

// Descrição com mais espaço do título
export function AlertDialogDescription({ children }) {
  return <p className="text-sm text-gray-600 mt-2">{children}</p>;
}

// Footer com mais espaço
export function AlertDialogFooter({ children }) {
  return <div className="flex justify-end gap-3 mt-6">{children}</div>;
}

// Botão de Cancelar agora usa o variant 'outline'
export function AlertDialogCancel({ children, onClick }) {
  return (
    <Button variant="outline" onClick={onClick}>
      {children}
    </Button>
  );
}

// Botão de Ação agora usa o variant 'danger'
export function AlertDialogAction({ children, onClick }) {
  return (
    <Button variant="danger" onClick={onClick}>
      {children}
    </Button>
  );
}

// Hook utilitário (sem alteração)
export function useAlertDialog() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);

  const showDialog = (children) => {
    setContent(children);
    setOpen(true);
  };

  const Dialog = () => (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {content}
    </AlertDialog>
  );

  return { showDialog, Dialog };
}