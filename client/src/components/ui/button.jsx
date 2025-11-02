// client/src/components/ui/button.jsx
import React from "react";

// Hook para variantes (sem `cva` ou `clsx`)
const buttonVariants = {
  // Nossas variantes principais
  variants: {
    primary:
      "bg-blue-600 text-white hover:bg-blue-600/90 focus-visible:ring-blue-500",
    secondary:
      "bg-gray-100 text-gray-900 hover:bg-gray-100/80 focus-visible:ring-gray-400",
    danger:
      "bg-red-600 text-white hover:bg-red-600/90 focus-visible:ring-red-500",
    outline:
      "border border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-400",
    ghost: "hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
    link: "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500",
  },
  // Nossos tamanhos
  sizes: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "default", // Adicionada prop de tamanho
  className = "",
  disabled, // Adicionada prop 'disabled'
}) {
  // Estilos base
  const baseClasses =
    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  // Resolve as classes
  const variantClasses = buttonVariants.variants[variant] || buttonVariants.variants.primary;
  const sizeClasses = buttonVariants.sizes[size] || buttonVariants.sizes.default;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[baseClasses, variantClasses, sizeClasses, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}