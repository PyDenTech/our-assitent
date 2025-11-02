import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";

/** Container principal
 * - Posição fixa para ocupar 100% da altura da tela (h-screen).
 */
export function Sidebar({ children, className = "" }) {
  return (
    <aside
      className={[
        "fixed top-0 left-0 w-64 h-screen flex flex-col z-40", // Alterado para fixed e h-screen
        "bg-white",
        "border-r border-blue-100",
        className,
      ].join(" ")}
    >
      {children}
    </aside>
  );
}

/** Cabeçalho
 * - Lógica corrigida para renderizar 'children' OU o logo padrão.
 */
export function SidebarHeader({ children }) {
  return (
    <div className="px-4 py-5 border-b border-blue-100">
      {children ? (
        children // Renderiza o conteúdo passado (ex: ícone de Users)
      ) : (
        // Renderiza o padrão (logo OA) se nenhum child for passado
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center shadow-md">
            <span className="text-white font-bold text-sm">OA</span>
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-gray-900 tracking-tight">
              OurAssist
            </div>
            <div className="text-xs text-blue-700/80 font-medium">
              Sistema de Gestão
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Conteúdo rolável */
export function SidebarContent({ children }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
      {children}
    </div>
  );
}

/** Rodapé
 * - Padding padronizado para 'px-4 py-4'.
 * - Relativo para o dropup menu.
 */
export function SidebarFooter({ children }) {
  // 'relative' é removido daqui e vai para o componente Dropdown
  return (
    <div className="px-4 py-4 border-t border-blue-100">{children}</div>
  );
}

/** Grupo e rótulos */
export function SidebarGroup({ children }) {
  return <div className="space-y-2">{children}</div>;
}

export function SidebarGroupLabel({ children }) {
  return (
    <div className="px-4 py-3 text-xs uppercase tracking-wider font-semibold text-gray-500">
      {children}
    </div>
  );
}

export function SidebarGroupContent({ children }) {
  return <div className="flex flex-col gap-1">{children}</div>;
}

/** Menu e itens */
export function SidebarMenu({ children }) {
  return <nav className="flex flex-col">{children}</nav>;
}

export function SidebarMenuItem({ children }) {
  return <div className="relative">{children}</div>;
}

/** Botão de item de menu */
export function SidebarMenuButton({
  to,
  icon: Icon,
  children,
  className = "",
  active = false,
  rightAddon = null,
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => to && navigate(to)}
      className={[
        "group w-full text-left relative",
        "px-3 py-2.5 rounded-lg",
        "flex items-center gap-3",
        "transition-colors duration-200",
        active
          ? "bg-blue-50 text-blue-700 font-semibold"
          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r",
          active
            ? "bg-blue-600"
            : "bg-transparent group-hover:bg-blue-200 group-hover:w-0.5",
          "transition-all",
        ].join(" ")}
      />
      {Icon && (
        <span
          className={[
            "grid place-items-center rounded-md transition-colors",
            active
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600",
            "w-8 h-8",
          ].join(" ")}
        >
          <Icon className="w-5 h-5" />
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {rightAddon && (
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
          {rightAddon}
        </span>
      )}
    </button>
  );
}

/** Provedor e trigger (mobile) */
export function SidebarProvider({ children }) {
  return <>{children}</>;
}

export function SidebarTrigger({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-2 rounded-lg border border-blue-200 bg-white/80 hover:bg-blue-50 text-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
      aria-label="Abrir menu"
      title="Abrir menu"
    >
      ☰
    </button>
  );
}

/* ========================================================================
 *
 * NOVOS COMPONENTES DE DROPDOWN/DROPUP (Sem novos imports)
 *
 * ======================================================================== */

const DropdownContext = createContext(null);

/** 1. O Provedor (Wrapper) */
export function Dropdown({ children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="relative" ref={menuRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/** 2. O Gatilho (Trigger) */
export function DropdownTrigger({ children }) {
  const { setOpen } = useContext(DropdownContext);
  return (
    <button
      type="button"
      className="w-full"
      onClick={() => setOpen((o) => !o)}
    >
      {children}
    </button>
  );
}

/** 3. O Conteúdo (Menu "Dropup") */
export function DropdownContent({ children, className = "" }) {
  const { open } = useContext(DropdownContext);
  if (!open) return null;

  return (
    <div
      className={[
        "absolute left-0 bottom-full mb-2 w-full min-w-[220px] z-50",
        "bg-white rounded-xl shadow-2xl border border-blue-100",
        "p-2",
        "animate-in fade-in-0 zoom-in-95", // Animação
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

/** 4. Item do Menu */
export function DropdownItem({
  children,
  icon: Icon,
  onClick,
  to,
  className = "",
}) {
  const { setOpen } = useContext(DropdownContext);
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    onClick?.();
    setOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        "flex items-center gap-3 w-full text-left",
        "px-3 py-2 rounded-lg text-sm font-medium",
        "text-gray-700 hover:bg-blue-50 hover:text-blue-700",
        "transition-colors duration-150",
        className,
      ].join(" ")}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span className="flex-1">{children}</span>
    </button>
  );
}

/** 5. Separador */
export function DropdownSeparator() {
  return <div className="h-px my-1 bg-blue-100" />;
}

/** 6. Rótulo (ex: "Tema") */
export function DropdownLabel({ children }) {
  return (
    <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}