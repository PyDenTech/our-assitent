import React from "react";
import { motion } from "framer-motion";

/**
 * Background animado: aurora + grid + partículas.
 * Camadas são não interativas e respeitam dark mode.
 */
export default function BackgroundFX({
  showGrid = true,
  showParticles = true,
  intensity = 1, // 0.5 a 1.5
}) {
  const particles = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: (i * 37) % 100, // distribuição simples
    y: (i * 53) % 100,
    delay: (i % 6) * 0.6,
    dur: 6 + (i % 5),  // 6–10s
    size: 2 + (i % 3), // 2–4px
  }));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Aurora em blobs */}
      <div className="absolute inset-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.35, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-24 -left-24 h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(35% 35% at 50% 50%, rgba(99,102,241,0.55), rgba(99,102,241,0) 70%)",
            filter: `blur(${36 * intensity}px)`,
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.30, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.1 }}
          className="absolute -bottom-24 -right-24 h-[40rem] w-[40rem] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(35% 35% at 50% 50%, rgba(79,70,229,0.55), rgba(79,70,229,0) 70%)",
            filter: `blur(${38 * intensity}px)`,
          }}
        />
        {/* halo central sutil */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.18 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(59,130,246,0.25), rgba(0,0,0,0) 60%)",
          }}
        />
      </div>

      {/* Grid opcional */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px, 40px 40px",
            color: "rgba(31,41,55,1)", // gray-800 base; dark mode ajusta abaixo
            mixBlendMode: "multiply",
          }}
        />
      )}

      {/* Partículas flutuantes */}
      {showParticles && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-indigo-400/40 dark:bg-indigo-300/30 shadow"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
              initial={{ y: 0, opacity: 0.0 }}
              animate={{ y: -30, opacity: 0.8 }}
              transition={{
                duration: p.dur,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: p.delay,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
