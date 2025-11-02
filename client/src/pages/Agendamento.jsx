import React, { useState } from "react";
import * as apiClient from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import MapaAssentos from "@/components/agendamento/MapaAssentos";
import CartaoEmbarque from "@/components/agendamento/CartaoEmbarque";

export default function Agendamento() {
  const [etapa, setEtapa] = useState(1);
  const [eventoSelecionado, setEventoSelecionado] = useState(null);
  const [tipoViagem, setTipoViagem] = useState("ida_volta");
  const [responsavel, setResponsavel] = useState({
    nome_completo: "",
    documento: "",
    telefone: "",
    email: "",
    sem_documento: false,
  });
  const [passageiros, setPassageiros] = useState([
    { nome_completo: "", documento: "", idade: "", parentesco: "próprio", sem_documento: false },
  ]);
  const [assentosSelecionados, setAssentosSelecionados] = useState([]);
  const [observacoes, setObservacoes] = useState("");
  const [agendamentoCriado, setAgendamentoCriado] = useState(null);

  const queryClient = useQueryClient();

  const { data: eventos = [] } = useQuery({
    queryKey: ["eventos", { status: "aberto" }],
    queryFn: () => apiClient.listEventos({ status: "aberto" }),
    initialData: [],
  });

  const { data: agendamentos = [] } = useQuery({
    queryKey: ["agendamentos"],
    queryFn: apiClient.listAgendamentos,
    initialData: [],
  });

  const criarAgendamentoMutation = useMutation({
    mutationFn: (data) => apiClient.createAgendamento(data),
    onSuccess: (data) => {
      setAgendamentoCriado(data);
      setEtapa(4);
      queryClient.invalidateQueries({ queryKey: ["agendamentos"] });
    },
  });

  const addPassageiro = () => {
    setPassageiros([
      ...passageiros,
      { nome_completo: "", documento: "", idade: "", parentesco: "", sem_documento: false },
    ]);
  };

  const removePassageiro = (index) => {
    setPassageiros(passageiros.filter((_, i) => i !== index));
  };

  const handleSelectAssento = (onibus, assento) => {
    const jaEstaNoArray = assentosSelecionados.some((a) => a.onibus === onibus && a.assento === assento);
    if (jaEstaNoArray) {
      setAssentosSelecionados(assentosSelecionados.filter((a) => !(a.onibus === onibus && a.assento === assento)));
    } else {
      if (assentosSelecionados.length < passageiros.length) {
        setAssentosSelecionados([...assentosSelecionados, { onibus, assento, passageiro: "" }]);
      }
    }
  };

  const atribuirAssentos = () => {
    const assentosComPassageiros = assentosSelecionados.map((assento, idx) => ({
      ...assento,
      passageiro: passageiros[idx]?.nome_completo || "",
    }));
    setAssentosSelecionados(assentosComPassageiros);
    setEtapa(3);
  };

  const finalizarAgendamento = () => {
    const numeroCartao = `EC${Date.now().toString().slice(-8)}`;

    const payloadResponsavel = {
      ...responsavel,
      documento: responsavel.sem_documento ? "NAO INFORMADO" : responsavel.documento,
    };

    const payloadPassageiros = passageiros.map((p) => ({
      ...p,
      documento: p.sem_documento ? "NAO INFORMADO" : p.documento,
    }));

    criarAgendamentoMutation.mutate({
      evento_id: eventoSelecionado.id,
      numero_cartao: numeroCartao,
      tipo_viagem: tipoViagem,
      responsavel: payloadResponsavel,
      passageiros: payloadPassageiros,
      assentos: assentosSelecionados,
      status: "confirmado",
      observacoes,
    });
  };

  const assentosOcupados = agendamentos
    .filter((a) => a.evento_id === (eventoSelecionado && eventoSelecionado.id))
    .flatMap((a) => a.assentos);

  const evento = eventos.find((e) => e.id === (eventoSelecionado && eventoSelecionado.id));

  const toggleSemDocumentoResponsavel = (checked) => {
    setResponsavel((r) => ({
      ...r,
      sem_documento: checked,
      documento: checked ? "NAO INFORMADO" : "",
    }));
  };

  const toggleSemDocumentoPassageiro = (idx, checked) => {
    const novos = [...passageiros];
    novos[idx].sem_documento = checked;
    novos[idx].documento = checked ? "NAO INFORMADO" : "";
    setPassageiros(novos);
  };

  const invalidoResponsavel =
    !responsavel.nome_completo ||
    !responsavel.telefone ||
    (!responsavel.sem_documento && !responsavel.documento);

  const invalidosPassageiros = passageiros.some(
    (p) => !p.nome_completo || (!p.sem_documento && !p.documento)
  );

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Agendar Viagem</h1>
          <p className="text-gray-500 mt-1">Reserve seus assentos para o próximo evento</p>
        </div>

        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map((num) => (
              <React.Fragment key={num}>
                <div className={`flex items-center gap-2 ${etapa >= num ? "text-blue-600" : "text-gray-400"}`}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      etapa >= num ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    {num}
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {num === 1 ? "Evento" : num === 2 ? "Passageiros" : num === 3 ? "Assentos" : "Cartão"}
                  </span>
                </div>
                {num < 4 && <div className={`w-12 h-1 ${etapa > num ? "bg-blue-600" : "bg-gray-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {etapa === 1 && (
            <motion.div key="etapa1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Selecione o Evento e Tipo de Viagem</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-lg font-semibold">Tipo de Viagem</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        variant={tipoViagem === "ida_volta" ? "default" : "outline"}
                        onClick={() => setTipoViagem("ida_volta")}
                        className={`h-20 flex flex-col gap-2 ${
                          tipoViagem === "ida_volta"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowLeftRight className="w-6 h-6" />
                        <span className="font-semibold">Ida e Volta</span>
                      </Button>
                      <Button
                        variant={tipoViagem === "somente_ida" ? "default" : "outline"}
                        onClick={() => setTipoViagem("somente_ida")}
                        className={`h-20 flex flex-col gap-2 ${
                          tipoViagem === "somente_ida"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowRight className="w-6 h-6" />
                        <span className="font-semibold">Somente Ida</span>
                      </Button>
                      <Button
                        variant={tipoViagem === "somente_volta" ? "default" : "outline"}
                        onClick={() => setTipoViagem("somente_volta")}
                        className={`h-20 flex flex-col gap-2 ${
                          tipoViagem === "somente_volta"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <ArrowLeft className="w-6 h-6" />
                        <span className="font-semibold">Somente Volta</span>
                      </Button>
                    </div>
                  </div>

                  {eventos.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Nenhum evento disponível no momento</p>
                    </div>
                  ) : (
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">Eventos Disponíveis</Label>
                      <div className="grid gap-4">
                        {eventos.map((evento) => {
                          const totalAssentos = evento.quantidade_onibus * (evento.capacidade_por_onibus - 1);
                          const ocupados = agendamentos
                            .filter((a) => a.evento_id === evento.id)
                            .reduce((acc, a) => acc + a.assentos.length, 0);
                          const disponiveis = totalAssentos - ocupados;

                          return (
                            <div
                              key={evento.id}
                              onClick={() => {
                                setEventoSelecionado(evento);
                                setEtapa(2);
                              }}
                              className="p-6 border-2 border-blue-100 rounded-xl cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all"
                            >
                              <h3 className="font-bold text-xl text-gray-900 mb-2">{evento.nome}</h3>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <p>📅 {new Date(evento.data_inicio).toLocaleDateString("pt-BR")}</p>
                                <p>🕐 {evento.horario_saida}</p>
                                <p className="col-span-2">📍 {evento.local}</p>
                                <p className="col-span-2 font-semibold text-blue-600">
                                  {disponiveis} assentos disponíveis de {totalAssentos}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {etapa === 2 && (
            <motion.div
              key="etapa2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Dados do Responsável</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nome Completo *</Label>
                      <Input
                        value={responsavel.nome_completo}
                        onChange={(e) => setResponsavel({ ...responsavel, nome_completo: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>CPF/RG *</Label>
                        <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                          <input
                            type="checkbox"
                            checked={responsavel.sem_documento}
                            onChange={(e) => toggleSemDocumentoResponsavel(e.target.checked)}
                          />
                          Sem Documento?
                        </label>
                      </div>
                      <Input
                        value={responsavel.documento}
                        onChange={(e) => setResponsavel({ ...responsavel, documento: e.target.value })}
                        placeholder="000.000.000-00"
                        disabled={responsavel.sem_documento}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Telefone *</Label>
                      <Input
                        value={responsavel.telefone}
                        onChange={(e) => setResponsavel({ ...responsavel, telefone: e.target.value })}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>E-mail</Label>
                      <Input
                        type="email"
                        value={responsavel.email}
                        onChange={(e) => setResponsavel({ ...responsavel, email: e.target.value })}
                        placeholder="seuemail@exemplo.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white flex flex-row justify-between items-center">
                  <CardTitle>Passageiros</CardTitle>
                  <Button onClick={addPassageiro} variant="secondary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {passageiros.map((passageiro, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-gray-900">Passageiro {idx + 1}</h4>
                        {passageiros.length > 1 && (
                          <Button variant="ghost" size="icon" onClick={() => removePassageiro(idx)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label>Nome Completo *</Label>
                          <Input
                            value={passageiro.nome_completo}
                            onChange={(e) => {
                              const novos = [...passageiros];
                              novos[idx].nome_completo = e.target.value;
                              setPassageiros(novos);
                            }}
                            placeholder="Nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>CPF/RG *</Label>
                            <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                              <input
                                type="checkbox"
                                checked={passageiro.sem_documento}
                                onChange={(e) => toggleSemDocumentoPassageiro(idx, e.target.checked)}
                              />
                              Sem Documento?
                            </label>
                          </div>
                          <Input
                            value={passageiro.documento}
                            onChange={(e) => {
                              const novos = [...passageiros];
                              novos[idx].documento = e.target.value;
                              setPassageiros(novos);
                            }}
                            placeholder="Documento"
                            disabled={passageiro.sem_documento}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Idade</Label>
                          <Input
                            type="number"
                            value={passageiro.idade}
                            onChange={(e) => {
                              const novos = [...passageiros];
                              novos[idx].idade = e.target.value;
                              setPassageiros(novos);
                            }}
                            placeholder="Idade"
                          />
                        </div>

                        <div className="md:col-span-4 space-y-2">
                          <Label>Parentesco</Label>
                          <Select
                            value={passageiro.parentesco}
                            onValueChange={(v) => {
                              const novos = [...passageiros];
                              novos[idx].parentesco = v;
                              setPassageiros(novos);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="próprio">Próprio</SelectItem>
                              <SelectItem value="cônjuge">Cônjuge</SelectItem>
                              <SelectItem value="filho(a)">Filho(a)</SelectItem>
                              <SelectItem value="pai/mãe">Pai/Mãe</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Alguma observação importante?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setEtapa(1)} size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={() => setEtapa(2.5)}
                  disabled={invalidoResponsavel || invalidosPassageiros}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  size="lg"
                >
                  Próximo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {etapa === 2.5 && (
            <motion.div
              key="etapa2.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Selecione os Assentos ({assentosSelecionados.length}/{passageiros.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  {Array.from({ length: eventoSelecionado.quantidade_onibus }, (_, i) => (
                    <MapaAssentos
                      key={i + 1}
                      numeroOnibus={i + 1}
                      capacidade={eventoSelecionado.capacidade_por_onibus}
                      assentosOcupados={assentosOcupados}
                      assentosSelecionados={assentosSelecionados}
                      onSelectAssento={handleSelectAssento}
                    />
                  ))}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setEtapa(2)} size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={atribuirAssentos}
                  disabled={assentosSelecionados.length !== passageiros.length}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600"
                  size="lg"
                >
                  Próximo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {etapa === 3 && (
            <motion.div key="etapa3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card className="border-blue-100 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                  <CardTitle>Confirme os Dados</CardTitle>
                </CardHeader>
              <CardContent className="p-6 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-3">Responsável</h3>
                    <p className="text-gray-700">{responsavel.nome_completo}</p>
                    <p className="text-sm text-gray-600">Doc: {responsavel.documento}</p>
                    <p className="text-sm text-gray-600">Tel: {responsavel.telefone}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Assentos e Passageiros</h3>
                    <div className="space-y-3">
                      {assentosSelecionados.map((assento, idx) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-white border border-blue-100 rounded-xl">
                          <div>
                            <p className="font-semibold">{assento.passageiro}</p>
                            <p className="text-sm text-gray-600">
                              {passageiros.find((p) => p.nome_completo === assento.passageiro)?.documento}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Ônibus {assento.onibus}</p>
                            <p className="text-2xl font-bold text-blue-600">#{assento.assento}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setEtapa(2.5)} size="lg">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </Button>
                <Button
                  onClick={finalizarAgendamento}
                  disabled={criarAgendamentoMutation.isPending}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {criarAgendamentoMutation.isPending ? "Finalizando..." : "Finalizar Agendamento"}
                </Button>
              </div>
            </motion.div>
          )}

          {etapa === 4 && agendamentoCriado && (
            <motion.div key="etapa4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CartaoEmbarque agendamento={agendamentoCriado} evento={evento} />
              <div className="text-center mt-8 no-print">
                <Button onClick={() => window.location.reload()} variant="outline" size="lg">
                  Fazer Novo Agendamento
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
