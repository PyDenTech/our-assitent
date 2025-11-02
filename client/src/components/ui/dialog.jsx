// client/src/components/ui/dialog.jsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
// O Botão agora será importado com os novos estilos
import { Button } from "./button"; 

export function Dialog({ open, onOpenChange, children }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      // Fundo mais escuro com blur e animação de fade-in
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in-0"
      onClick={() => onOpenChange?.(false)}
    >
      <div
        // Cantos arredondados, sombra forte, e animação de zoom-in
        // p-0 para deixar os filhos controlarem o padding
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-90"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogContent({ children, className = "" }) {
  // Este agora é o "corpo" principal, com padding
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function DialogHeader({ children, className = "" }) {
  // Padding e borda mais suave, sem margem
  return (
    <div className={`p-6 border-b border-blue-100 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = "" }) {
  // Fonte maior e mais suave
  return (
    <h2 className={`text-xl font-semibold text-gray-900 ${className}`}>
      {children}
    </h2>
  );
}

export function DialogFooter({ children, className = "" }) {
  // Padding e borda mais suave, sem margem
  return (
    <div
      className={`flex justify-end gap-3 p-6 border-t border-blue-100 ${className}`}
    >
      {children}
    </div>
  );
}