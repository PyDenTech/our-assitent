import React, { useState } from "react";
// Importa o NOVO apiClient em vez do base44
import * as apiClient from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings, Search, Filter, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AgendamentoCard from "../components/gerenciar/AgendamentoCard";
import EditarAgendamentoDialog from "../components/gerenciar/EditarAgendamentoDialog";
import ProtectedRoute from "../components/layout/ProtectedRoute";

function GerenciarContent() {
    const [busca, setBusca] = useState("");
    const [eventoFiltro, setEventoFiltro] = useState("todos");
    const [editando, setEditando] = useState(null);
    const [excluindo, setExcluindo] = useState(null);
    const queryClient = useQueryClient();

    // ATUALIZADO: Usando apiClient.listEventos
    const { data: eventos } = useQuery({
        queryKey: ['eventos'],
        queryFn: apiClient.listEventos, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.listAgendamentos
    const { data: agendamentos, isLoading } = useQuery({
        queryKey: ['agendamentos'],
        queryFn: apiClient.listAgendamentos, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.updateAgendamento
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => apiClient.updateAgendamento(id, data), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
            setEditando(null);
        },
    });

    // ATUALIZADO: Usando apiClient.deleteAgendamento
    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.deleteAgendamento(id), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
            setExcluindo(null);
        },
    });

    // Lógica de filtro local (permanece a mesma)
    const agendamentosFiltrados = agendamentos.filter(agendamento => {
        const matchEvento = eventoFiltro === "todos" || agendamento.evento_id === eventoFiltro;
        const matchBusca = busca === "" ||
            agendamento.numero_cartao.toLowerCase().includes(busca.toLowerCase()) ||
            (agendamento.responsavel && agendamento.responsavel.nome_completo && agendamento.responsavel.nome_completo.toLowerCase().includes(busca.toLowerCase())) ||
            (agendamento.passageiros && agendamento.passageiros.some(p => p.nome_completo && p.nome_completo.toLowerCase().includes(busca.toLowerCase())));

        return matchEvento && matchBusca;
    });

    // Lógica local (permanece a mesma)
    const todosAssentos = agendamentos.flatMap(a =>
        a.assentos ? a.assentos.map(assento => ({
            ...assento,
            agendamento_id: a.id,
            evento_id: a.evento_id
        })) : []
    );

    // Handlers (permanecem os mesmos)
    const handleEdit = (agendamento) => {
        setEditando(agendamento);
    };

    const handleSave = (id, dados) => {
        updateMutation.mutate({ id, data: dados });
    };

    const handleDelete = (id) => {
        setExcluindo(id);
    };

    const confirmarExclusao = () => {
        if (excluindo) {
            deleteMutation.mutate(excluindo);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Gerenciar Reservas</h1>
                        <p className="text-gray-500 mt-1">Edite, mova ou exclua agendamentos</p>
                    </div>
                </div>

                <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filtros de Busca
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar por nome, documento ou número do cartão..."
                                    className="pl-10"
                                />
                            </div>
                            <Select value={eventoFiltro} onValueChange={setEventoFiltro}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filtrar por evento" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os Eventos</SelectItem>
                                    {eventos.map(evento => (
                                        <SelectItem key={evento.id} value={evento.id}>
                                            {evento.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-900">{agendamentosFiltrados.length}</span> {agendamentosFiltrados.length === 1 ? 'agendamento encontrado' : 'agendamentos encontrados'}
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : agendamentosFiltrados.length === 0 ? (
                    <Card className="border-blue-100">
                        <CardContent className="py-20 text-center">
                            <Settings className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">
                                {busca || eventoFiltro !== "todos"
                                    ? "Nenhum agendamento encontrado com esses filtros"
                                    : "Nenhum agendamento cadastrado ainda"}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {agendamentosFiltrados.map(agendamento => (
                                <motion.div
                                    key={agendamento.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <AgendamentoCard
                                        agendamento={agendamento}
                                        evento={eventos.find(e => e.id === agendamento.evento_id)}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {editando && (
                    <EditarAgendamentoDialog
                        agendamento={editando}
                        evento={eventos.find(e => e.id === editando.evento_id)}
                        onSave={handleSave}
                        onClose={() => setEditando(null)}
                        isSaving={updateMutation.isPending}
                        todosAssentos={todosAssentos}
                    />
                )}

                <AlertDialog open={!!excluindo} onOpenChange={() => setExcluindo(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita e liberará os assentos ocupados.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={confirmarExclusao}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export default function Gerenciar() {
    return (
        <ProtectedRoute requiredDesignacoes={['gestor_eventos', 'operador_mapeamento']}>
            <GerenciarContent />
        </ProtectedRoute>
    );
}