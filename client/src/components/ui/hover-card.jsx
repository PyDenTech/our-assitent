// client/src/components/ui/hover-card.jsx
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

// Importamos o createPortal que você já usa
import { createPortal } from "react-dom"

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  // Usamos createPortal para garantir que ele flutue sobre tudo
  createPortal(
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      // Estilos do seu componente original, mas com animação
      className={[
        "z-[9999] w-auto rounded-md border border-gray-200 bg-white p-4 text-gray-800 shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className,
      ].filter(Boolean).join(" ")}
      {...props}
    />,
    document.body
  )
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }