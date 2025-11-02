// client/src/components/agendamento/MapaAssentos.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Armchair, User } from "lucide-react";

export default function MapaAssentos({
  numeroOnibus,
  capacidade,
  assentosOcupados,
  assentosSelecionados,
  onSelectAssento,
}) {
  const isOcupado = (n) =>
    assentosOcupados.some((a) => a.onibus === numeroOnibus && a.assento === n);
  const isSelecionado = (n) =>
    assentosSelecionados.some((a) => a.onibus === numeroOnibus && a.assento === n);

  const SEAT = 44;
  const GAP = 8;
  const COL_H = SEAT * 2 + GAP;

  const SeatGhost = () => (
    <div
      className="rounded-lg border border-transparent"
      style={{ width: SEAT, height: SEAT }}
      aria-hidden
    />
  );

  const SeatBtn = ({ n, isDriver = false }) => {
    if (!n || n > capacidade) return null;
    const motorista = isDriver || n === 1;
    const ocupado = isOcupado(n);
    const selecionado = isSelecionado(n);

    return (
      <motion.div
        whileHover={{ scale: ocupado || motorista ? 1 : 1.06 }}
        whileTap={{ scale: ocupado || motorista ? 1 : 0.96 }}
      >
        <Button
          type="button"
          variant="ghost"
          className={`w-11 h-11 p-0 rounded-lg flex flex-col items-center justify-center gap-0.5 text-[14px] shadow-sm
            ${
              motorista
                ? "bg-gray-800 text-white cursor-not-allowed"
                : ocupado
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : selecionado
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white ring-2 ring-blue-300"
                : "bg-white border border-gray-300 hover:bg-blue-50 hover:border-blue-400"
            }`}
          disabled={ocupado || motorista}
          onClick={() => !ocupado && !motorista && onSelectAssento(numeroOnibus, n)}
          title={motorista ? "Motorista" : `Assento ${n}`}
        >
          {motorista ? (
            <User style={{ width: 28, height: 28 }} className="text-white" />
          ) : (
            <Armchair
              style={{ width: 28, height: 28 }}
              className={selecionado ? "text-white" : "text-blue-600"}
            />
          )}
          <span className="font-semibold">{n}</span>
        </Button>
      </motion.div>
    );
  };

  // Primeira coluna invertida: ESQ = 2, DIR = 1 (motorista)
  const colunas = [{ left: [2], right: [1] }];
  // Demais colunas: 2+2
  for (let n = 3; n <= capacidade; n += 4) {
    colunas.push({ left: [n, n + 1], right: [n + 2, n + 3] });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg grid place-items-center">
            <span className="text-white text-sm font-bold">#{numeroOnibus}</span>
          </div>
          Ônibus {numeroOnibus}
        </h3>
        <div className="flex gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Armchair className="w-4 h-4 text-gray-400" />
            Livre
          </span>
          <span className="flex items-center gap-1">
            <Armchair className="w-4 h-4 text-blue-500" />
            Selecionado
          </span>
          <span className="flex items-center gap-1">
            <Armchair className="w-4 h-4 text-gray-400 opacity-60" />
            Ocupado
          </span>
        </div>
      </div>

      <div className="relative rounded-2xl p-3 shadow-xl border-2 border-gray-200 bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="flex gap-[2px] overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          {colunas.map((col, idx) => (
            <div key={idx} className="min-w-[84px] flex flex-col items-center">
              {/* lado esquerdo */}
              <div
                className="flex flex-col items-center justify-between gap-1.5"
                style={{ height: COL_H }}
              >
                {col.left.length === 1 ? (
                  <>
                    <SeatBtn n={col.left[0]} />
                    <SeatGhost />
                  </>
                ) : (
                  col.left.map((n) => <SeatBtn key={n} n={n} />)
                )}
              </div>

              {/* corredor compacto */}
              <div className="my-[10px] w-5 h-[5px] rounded-full bg-gray-200" aria-hidden />

              {/* lado direito */}
              <div
                className="flex flex-col items-center justify-between gap-1.5"
                style={{ height: COL_H }}
              >
                {col.right.length === 1 ? (
                  <>
                    <SeatGhost />
                    <SeatBtn n={col.right[0]} isDriver />
                  </>
                ) : (
                  col.right.map((n) => <SeatBtn key={n} n={n} />)
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 text-center text-xs text-gray-600 font-medium">
          Total: {capacidade} lugares ({Math.max(0, capacidade - 1)} para passageiros)
        </div>
      </div>
    </div>
  );
}
