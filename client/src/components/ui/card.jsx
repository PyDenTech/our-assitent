// client/src/components/ui/card.jsx
import React from "react";

// Cantos mais arredondados, borda e sombra mais sutis e consistentes
export function Card({ className = "", children }) {
  return (
    <div
      className={`rounded-xl border border-blue-100 bg-white shadow-lg shadow-blue-500/10 ${className}`}
    >
      {children}
    </div>
  );
}

// Padding aumentado e borda removida
export function CardHeader({ className = "", children }) {
  return (
    <div className={`p-6 flex flex-col gap-1.5 ${className}`}>{children}</div>
  );
}

// Tipografia melhorada
export function CardTitle({ children, className = "" }) {
  return (
    <h2
      className={`text-xl font-semibold tracking-tight text-gray-900 ${className}`}
    >
      {children}
    </h2>
  );
}

// Novo componente para descrições, muito comum em Cards
export function CardDescription({ children, className = "" }) {
  return (
    <p className={`text-sm text-gray-600 ${className}`}>
      {children}
    </p>
  );
}

// Padding aumentado
export function CardContent({ className = "", children }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

// Padding aumentado, borda removida, e gap maior
export function CardFooter({ className = "", children }) {
  return (
    <div className={`p-6 flex justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
}