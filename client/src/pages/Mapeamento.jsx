import React, { useMemo, useState } from "react";
import * as apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapIcon, Calendar, Bus, Download } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import dayjs from "dayjs";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import OnibusVisual from "../components/mapeamento/OnibusVisual";
import LegendaPassageiros from "../components/mapeamento/LegendaPassageiros";
import ProtectedRoute from "../components/layout/ProtectedRoute";

/* ---------- helpers de formatação ---------- */
function formatDocumento(doc) {
  if (!doc) return "Não informado";
  const d = String(doc).replace(/\D/g, "");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  return String(doc);
}

function agruparPorOnibus(assentos) {
  return assentos.reduce((acc, item) => {
    const key = item.onibus ?? "N/I";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/* ---------- geração do PDF ---------- */
function exportarPDFListaCompleta(assentosOcupados, evento) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const agora = dayjs().format("DD/MM/YYYY HH:mm");
  const titulo = "Lista de Passageiros";
  const eventoNome = evento?.nome || evento?.titulo || "Evento não informado";
  const local = evento?.local || "—";
  const total = assentosOcupados.length;

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titulo, 40, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Evento: ${eventoNome}`, 40, 70);
  doc.text(`Local: ${local}`, 40, 86);
  doc.text(`Gerado em: ${agora}`, 40, 102);
  doc.text(`Total de passageiros: ${total}`, 40, 118);

  // Agrupa por ônibus
  const porOnibus = agruparPorOnibus(assentosOcupados);
  const keysOrdenadas = Object.keys(porOnibus).sort((a, b) => Number(a) - Number(b));

  let primeira = true;

  keysOrdenadas.forEach((onibusKey) => {
    const linhas = [...porOnibus[onibusKey]].sort((a, b) => (a.assento || 0) - (b.assento || 0));

    if (!primeira) doc.addPage();
    primeira = false;

    // Título da seção
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`Ônibus ${onibusKey}`, 40, 148);

    // Tabela
    const body = linhas.map((r) => [
      r.assento ?? "-",
      r.passageiro_nome ?? "-",
      formatDocumento(
        r.passageiro_doc ??
          r.documento ?? // fallback
          ""
      ),
      r.responsavel_nome ?? "-",
      r.responsavel_tel ?? "-",
      r.numero_cartao ?? "-",
      r.tipo_viagem === "ida_volta"
        ? "Ida e Volta"
        : r.tipo_viagem === "somente_ida"
        ? "Só Ida"
        : r.tipo_viagem === "somente_volta"
        ? "Só Volta"
        : "-",
    ]);

    autoTable(doc, {
      startY: 162,
      head: [
        [
          "Assento",
          "Passageiro",
          "Documento",
          "Responsável",
          "Telefone",
          "Cartão",
          "Tipo de viagem",
        ],
      ],
      body,
      styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      theme: "grid",
      didDrawPage: () => {
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(
          `Página ${doc.getNumberOfPages()}`,
          pageSize.width - 80,
          pageHeight - 20
        );
      },
    });
  });

  const nomeArquivo = `lista-passageiros-${dayjs().format("YYYY-MM-DD")}.pdf`;
  doc.save(nomeArquivo);
}

function MapeamentoContent() {
  const [eventoSelecionado, setEventoSelecionado] = useState(""); // manter string
  const [onibusVisualizar, setOnibusVisualizar] = useState("todos");

  // Eventos
  const { data: eventos } = useQuery({
    queryKey: ["eventos"],
    queryFn: apiClient.listEventos,
    initialData: [],
  });

  // Agendamentos
  const { data: agendamentos } = useQuery({
    queryKey: ["agendamentos"],
    queryFn: apiClient.listAgendamentos,
    initialData: [],
  });

  // Encontrar evento pelo id (comparando string)
  const evento = useMemo(() => {
    return eventos.find((e) => String(e.id) === String(eventoSelecionado));
  }, [eventos, eventoSelecionado]);

  // Montagem dos assentos ocupados
  const assentosOcupados = useMemo(() => {
    const evIdStr = String(eventoSelecionado || "");
    return agendamentos
      .filter((a) => String(a.evento_id) === evIdStr)
      .flatMap((a) =>
        (a.assentos || []).map((assento) => ({
          ...assento,
          passageiro_nome: assento.passageiro,
          passageiro_doc:
            (a.passageiros || []).find(
              (p) => p.nome_completo === assento.passageiro
            )?.documento || assento.documento, // fallback
          numero_cartao: a.numero_cartao,
          tipo_viagem: a.tipo_viagem,
        }))
      );
  }, [agendamentos, eventoSelecionado]);

  // Métricas
  const totalAssentosDisponis = evento
    ? evento.quantidade_onibus * (evento.capacidade_por_onibus - 1)
    : 0;
  const percentualOcupacao =
    totalAssentosDisponis > 0
      ? Math.round((assentosOcupados.length / totalAssentosDisponis) * 100)
      : 0;

  // Agrupamento para renderização em LISTA
  const passageirosPorOnibus = useMemo(() => {
    const mapa = agruparPorOnibus(assentosOcupados);
    // Se filtrar ônibus específico:
    if (onibusVisualizar !== "todos") {
      const apenas = {};
      apenas[onibusVisualizar] = mapa[onibusVisualizar] || [];
      return apenas;
    }
    return mapa;
  }, [assentosOcupados, onibusVisualizar]);

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 no-print">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Mapeamento de Ônibus
              </h1>
              <p className="text-gray-500 mt-1">
                Visualize a ocupação completa e gere a lista organizada por ônibus
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => exportarPDFListaCompleta(assentosOcupados, evento)}
              disabled={!eventoSelecionado || !evento}
              size="lg"
              className="no-print"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar PDF (Lista completa)
            </Button>
          </div>
        </div>

        {/* Seletor de evento */}
        <Card className="border-blue-100 shadow-xl no-print">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <CardTitle>Selecione o Evento</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Select
              value={eventoSelecionado}
              onValueChange={setEventoSelecionado}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {eventos.map((ev) => (
                  <SelectItem key={ev.id} value={String(ev.id)}>
                    {ev.nome} -{" "}
                    {ev.data_inicio
                      ? format(new Date(ev.data_inicio), "dd/MM/yyyy")
                      : "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {eventoSelecionado && evento ? (
          <>
            {/* Cabeçalho do evento */}
            <Card className="border-blue-100 shadow-lg print-card-clean">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <Calendar className="w-8 h-8 text-blue-600 mt-1" />
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">
                        {evento.nome}
                      </h3>
                      <p className="text-gray-600">{evento.local || "—"}</p>
                      <p className="text-sm text-gray-500">
                        {evento.data_inicio
                          ? format(
                              new Date(evento.data_inicio),
                              "dd 'de' MMMM 'de' yyyy",
                              { locale: ptBR }
                            )
                          : "—"}{" "}
                        {evento.horario_saida ? `às ${evento.horario_saida}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Ônibus</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {evento.quantidade_onibus}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Passageiros</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {assentosOcupados.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Ocupação</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {percentualOcupacao}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="mapa" className="space-y-6">
              <TabsList className="bg-white border border-blue-100 shadow-sm no-print">
                <TabsTrigger value="mapa" className="flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Mapa Visual
                </TabsTrigger>
                <TabsTrigger value="lista" className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4" />
                  Lista Completa
                </TabsTrigger>
              </TabsList>

              {/* Mapa Visual */}
              <TabsContent value="mapa" className="space-y-6">
                <div className="grid gap-6">
                  {Array.from(
                    { length: evento.quantidade_onibus },
                    (_, i) => (
                      <OnibusVisual
                        key={i + 1}
                        numeroOnibus={i + 1}
                        capacidade={evento.capacidade_por_onibus}
                        assentosOcupados={assentosOcupados}
                      />
                    )
                  )}
                </div>
              </TabsContent>

              {/* Lista Completa (organizada por ônibus) */}
              <TabsContent value="lista" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 no-print">
                  <Button
                    variant={
                      onibusVisualizar === "todos" ? "default" : "outline"
                    }
                    onClick={() => setOnibusVisualizar("todos")}
                    className={
                      onibusVisualizar === "todos" ? "bg-blue-600" : ""
                    }
                  >
                    Todos os Ônibus
                  </Button>
                  <Select
                    value={onibusVisualizar}
                    onValueChange={setOnibusVisualizar}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por ônibus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Ônibus</SelectItem>
                      {Array.from(
                        { length: evento.quantidade_onibus },
                        (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={String(i + 1)}
                          >
                            Ônibus {i + 1}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Renderização agrupada e estilizada */}
                {Object.keys(passageirosPorOnibus)
                  .sort((a, b) => Number(a) - Number(b))
                  .map((key) => {
                    const linhas = [...(passageirosPorOnibus[key] || [])].sort(
                      (a, b) => (a.assento || 0) - (b.assento || 0)
                    );
                    return (
                      <Card
                        key={key}
                        className="border border-blue-100 shadow-md print-card-clean"
                      >
                        <CardHeader className="bg-blue-50">
                          <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Bus className="w-5 h-5" />
                            Ônibus {key}
                            <span className="ml-2 text-sm font-normal text-blue-600">
                              ({linhas.length} passageiros)
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-blue-100 text-blue-900">
                                  <th className="px-4 py-2 text-left">Assento</th>
                                  <th className="px-4 py-2 text-left">Passageiro</th>
                                  <th className="px-4 py-2 text-left">Documento</th>
                                  <th className="px-4 py-2 text-left">Responsável</th>
                                  <th className="px-4 py-2 text-left">Telefone</th>
                                  <th className="px-4 py-2 text-left">Cartão</th>
                                  <th className="px-4 py-2 text-left">Viagem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {linhas.map((r, idx) => (
                                  <tr
                                    key={`${key}-${idx}`}
                                    className={idx % 2 ? "bg-white" : "bg-blue-50/30"}
                                  >
                                    <td className="px-4 py-2">{r.assento ?? "-"}</td>
                                    <td className="px-4 py-2">{r.passageiro_nome ?? "-"}</td>
                                    <td className="px-4 py-2">
                                      {formatDocumento(
                                        r.passageiro_doc ??
                                          r.documento ??
                                          ""
                                      )}
                                    </td>
                                    <td className="px-4 py-2">{r.responsavel_nome ?? "-"}</td>
                                    <td className="px-4 py-2">{r.responsavel_tel ?? "-"}</td>
                                    <td className="px-4 py-2">{r.numero_cartao ?? "-"}</td>
                                    <td className="px-4 py-2">
                                      {r.tipo_viagem === "ida_volta"
                                        ? "Ida e Volta"
                                        : r.tipo_viagem === "somente_ida"
                                        ? "Só Ida"
                                        : r.tipo_viagem === "somente_volta"
                                        ? "Só Volta"
                                        : "-"}
                                    </td>
                                  </tr>
                                ))}
                                {linhas.length === 0 && (
                                  <tr>
                                    <td
                                      className="px-4 py-6 text-center text-gray-500"
                                      colSpan={7}
                                    >
                                      Sem passageiros para este ônibus.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card className="border-blue-100 no-print">
            <CardContent className="py-20 text-center">
              <MapIcon className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                Selecione um evento para visualizar o mapeamento
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Mapeamento() {
  return (
    <ProtectedRoute requiredDesignacoes={["gestor_eventos", "visualizador_eventos", "operador_mapeamento"]}>
      <MapeamentoContent />
    </ProtectedRoute>
  );
}
