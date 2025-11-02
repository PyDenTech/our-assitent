import React, { useState } from "react";
// Importa o NOVO apiClient em vez do base44
import * as apiClient from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, Bus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import EventoCard from "../components/dashboard/EventoCard";
import EventoForm from "../components/dashboard/EventoForm";
import ProtectedRoute from "../components/layout/ProtectedRoute";

function DashboardContent() {
    const [showForm, setShowForm] = useState(false);
    const [editingEvento, setEditingEvento] = useState(null);
    const queryClient = useQueryClient();

    // ATUALIZADO: Usando apiClient.listEventos
    const { data: eventos, isLoading: loadingEventos } = useQuery({
        queryKey: ['eventos'],
        queryFn: apiClient.listEventos, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.listAgendamentos
    const { data: agendamentos, isLoading: loadingAgendamentos } = useQuery({
        queryKey: ['agendamentos'],
        queryFn: apiClient.listAgendamentos, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.createEvento
    const createMutation = useMutation({
        mutationFn: (data) => apiClient.createEvento(data), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventos'] });
            setShowForm(false);
            setEditingEvento(null);
        },
    });

    // ATUALIZADO: Usando apiClient.updateEvento
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => apiClient.updateEvento(id, data), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventos'] });
            setShowForm(false);
            setEditingEvento(null);
        },
    });

    // ATUALIZADO: Usando apiClient.deleteEvento
    const deleteMutation = useMutation({
        mutationFn: (id) => apiClient.deleteEvento(id), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['eventos'] });
        },
    });

    const handleSave = (data) => {
        if (editingEvento) {
            updateMutation.mutate({ id: editingEvento.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (evento) => {
        setEditingEvento(evento);
        setShowForm(true);
    };

    // Lógica de cálculo (permanece a mesma)
    // Nota: o backend já define a capacidade como 46, então (46-1) = 45 é o correto.
    const totalAssentos = eventos.reduce((acc, e) => acc + (e.quantidade_onibus * (e.capacidade_por_onibus - 1)), 0);
    const assentosOcupados = agendamentos.reduce((acc, a) => acc + a.assentos.length, 0);
    const totalPassageiros = agendamentos.reduce((acc, a) => acc + a.passageiros.length, 0);

    return (
        <div className="p-6 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Painel Administrativo</h1>
                    <p className="text-gray-500 mt-1">Gerencie eventos e agendamentos</p>
                </div>
                <Button
                    onClick={() => {
                        setEditingEvento(null);
                        setShowForm(true);
                    }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
                    size="lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Evento
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total de Eventos</CardTitle>
                            <Calendar className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900">{eventos.length}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {eventos.filter(e => e.status === 'aberto').length} abertos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Total de Passageiros</CardTitle>
                            <Users className="w-8 h-8 text-indigo-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900">{totalPassageiros}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {agendamentos.length} agendamentos
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-blue-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-medium text-gray-500">Ocupação de Assentos</CardTitle>
                            <Bus className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-gray-900">
                            {totalAssentos > 0 ? Math.round((assentosOcupados / totalAssentos) * 100) : 0}%
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            {assentosOcupados}/{totalAssentos} assentos
                        </p>
                    </CardContent>
                </Card>
            </div>

            {showForm && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <EventoForm
                        evento={editingEvento}
                        onSave={handleSave}
                        onCancel={() => {
                            setShowForm(false);
                            setEditingEvento(null);
                        }}
                        isSaving={createMutation.isPending || updateMutation.isPending}
                    />
                </div>
            )}

            <Tabs defaultValue="todos" className="space-y-6">
                <TabsList className="bg-white border border-blue-100 shadow-sm">
                    <TabsTrigger value="todos">Todos</TabsTrigger>
                    <TabsTrigger value="abertos">Abertos</TabsTrigger>
                    <TabsTrigger value="fechados">Fechados</TabsTrigger>
                </TabsList>

                <TabsContent value="todos" className="space-y-6">
                    {loadingEventos ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : eventos.length === 0 ? (
                        <Card className="border-blue-100">
                            <CardContent className="py-12 text-center">
                                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Nenhum evento cadastrado ainda</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {eventos.map(evento => (
                                <EventoCard
                                    key={evento.id}
                                    evento={evento}
                                    onEdit={handleEdit}
                                    onDelete={deleteMutation.mutate}
                                    agendamentos={agendamentos}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="abertos" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventos.filter(e => e.status === 'aberto').map(evento => (
                            <EventoCard
                                key={evento.id}
                                evento={evento}
                                onEdit={handleEdit}
                                onDelete={deleteMutation.mutate}
                                agendamentos={agendamentos}
                            />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="fechados" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventos.filter(e => e.status === 'fechado').map(evento => (
                            <EventoCard
                                key={evento.id}
                                evento={evento}
                                onEdit={handleEdit}
                                onDelete={deleteMutation.mutate}
                                agendamentos={agendamentos}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

export default function Dashboard() {
    // O ProtectedRoute não muda, ele continua envolvendo o conteúdo
    // e sua lógica interna (que usará apiClient.getMe) funcionará
    return (
        <ProtectedRoute requiredDesignacoes={['gestor_eventos', 'visualizador_eventos', 'operador_mapeamento']}>
            <DashboardContent />
        </ProtectedRoute>
    );
}