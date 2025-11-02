import React, { useState } from "react";
// Importa o NOVO apiClient em vez do base44
import * as apiClient from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, UserPlus, Search, Settings, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

// Esta constante de definições permanece a mesma
const DESIGNACOES_DISPONIVEIS = [
    { value: "gestor_eventos", label: "Gestor de Eventos", descricao: "Acesso completo ao módulo de eventos (Dashboard, Gerenciar, Mapeamento)" },
    { value: "visualizador_eventos", label: "Visualizador de Eventos", descricao: "Apenas visualização de Dashboard e Mapeamento" },
    { value: "operador_mapeamento", label: "Operador de Mapeamento", descricao: "Acesso ao Dashboard, Gerenciar e Mapeamento" },
];

export default function ConfiguracaoAcesso() {
    const [busca, setBusca] = useState("");
    const [editando, setEditando] = useState(null);
    const [designacoesSelecionadas, setDesignacoesSelecionadas] = useState([]);
    const queryClient = useQueryClient();

    // ATUALIZADO: Usando apiClient.getMe
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'], // A chave 'currentUser' é usada em vários locais (Layout, ProtectedRoute)
        queryFn: apiClient.getMe, // <-- MUDOU
    });

    // ATUALIZADO: Usando apiClient.listUsers
    const { data: usuarios, isLoading } = useQuery({
        queryKey: ['usuarios'],
        queryFn: apiClient.listUsers, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.updateUser
    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }) => apiClient.updateUser(id, data), // <-- MUDOU
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['usuarios'] });
            // Também é bom invalidar o 'currentUser' caso o admin edite a si mesmo
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            setEditando(null);
            setDesignacoesSelecionadas([]);
        },
    });

    // Verificar se usuário atual é admin
    // (A lógica de verificação permanece a mesma)
    if (!currentUser || currentUser.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md border-red-200 shadow-xl">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Lock className="w-20 h-20 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
                        <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // A lógica local de filtro e handlers permanece a mesma
    const usuariosFiltrados = usuarios.filter(user =>
        user.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
        user.email?.toLowerCase().includes(busca.toLowerCase())
    );

    const handleEditarDesignacoes = (usuario) => {
        setEditando(usuario);
        setDesignacoesSelecionadas(usuario.designacoes || []);
    };

    const handleSalvarDesignacoes = () => {
        if (editando) {
            updateUserMutation.mutate({
                id: editando.id,
                data: { designacoes: designacoesSelecionadas }
            });
        }
    };

    const toggleDesignacao = (designacao) => {
        if (designacoesSelecionadas.includes(designacao)) {
            setDesignacoesSelecionadas(designacoesSelecionadas.filter(d => d !== designacao));
        } else {
            setDesignacoesSelecionadas([...designacoesSelecionadas, designacao]);
        }
    };

    // O JSX/HTML permanece idêntico, pois ele só depende 
    // do estado e dos dados (que agora vêm do apiClient)
    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Configuração de Acesso</h1>
                        <p className="text-gray-500 mt-1">Gerencie designações e permissões dos usuários</p>
                    </div>
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                    <p className="text-sm text-blue-800">
                        <strong>ℹ️ Importante:</strong> Apenas usuários com designações podem acessar Dashboard, Gerenciar Reservas e Mapeamento.
                        As páginas "Agendar Viagem" e "Consultar Reserva" são públicas e acessíveis a todos.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {DESIGNACOES_DISPONIVEIS.map((designacao) => (
                        <Card key={designacao.value} className="border-purple-100 shadow-lg">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-purple-600" />
                                    {designacao.label}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">{designacao.descricao}</p>
                                <div className="mt-3">
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        {/* O 'usuarios' aqui já é o array vindo do apiClient */}
                                        {usuarios.filter(u => u.designacoes?.includes(designacao.value)).length} usuários
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card className="border-purple-100 shadow-xl">
                    <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                        <CardTitle className="flex items-center gap-2">
                            <UserPlus className="w-6 h-6" />
                            Gerenciar Usuários
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="mb-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    placeholder="Buscar usuário por nome ou email..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <AnimatePresence>
                                    {usuariosFiltrados.map((usuario) => (
                                        <motion.div
                                            key={usuario.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                        >
                                            <div className="p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-all">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-bold text-lg">
                                                                {usuario.full_name?.[0]?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-gray-900 truncate">{usuario.full_name}</p>
                                                                {usuario.role === 'admin' && (
                                                                    <Badge className="bg-red-100 text-red-800 border-red-300">Admin</Badge>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-600 truncate">{usuario.email}</p>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {usuario.designacoes && usuario.designacoes.length > 0 ? (
                                                                    usuario.designacoes.map(d => {
                                                                        const designacao = DESIGNACOES_DISPONIVEIS.find(des => des.value === d);
                                                                        return (
                                                                            <Badge key={d} variant="outline" className="bg-white text-xs">
                                                                                {designacao?.label || d}
                                                                            </Badge>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <span className="text-xs text-gray-400">Sem designações (acesso apenas a páginas públicas)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleEditarDesignacoes(usuario)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="ml-4"
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </Button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {editando && (
                    <Dialog open onOpenChange={() => setEditando(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">Editar Designações</DialogTitle>
                                <p className="text-gray-600">{editando.full_name} - {editando.email}</p>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <Label className="text-lg font-semibold">Designações Disponíveis</Label>
                                <p className="text-sm text-gray-600">
                                    Selecione as designações para dar acesso às páginas administrativas.
                                    Sem designações, o usuário terá acesso apenas a "Agendar Viagem" e "Consultar Reserva".
                                </p>
                                <div className="grid gap-3">
                                    {DESIGNACOES_DISPONIVEIS.map((designacao) => (
                                        <div
                                            key={designacao.value}
                                            onClick={() => toggleDesignacao(designacao.value)}
                                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${designacoesSelecionadas.includes(designacao.value)
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${designacoesSelecionadas.includes(designacao.value)
                                                        ? 'border-purple-500 bg-purple-500'
                                                        : 'border-gray-300'
                                                    }`}>
                                                    {designacoesSelecionadas.includes(designacao.value) && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{designacao.label}</p>
                                                    <p className="text-sm text-gray-600 mt-1">{designacao.descricao}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditando(null)}>
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSalvarDesignacoes}
                                    disabled={updateUserMutation.isPending}
                                    className="bg-gradient-to-r from-purple-500 to-indigo-600"
                                >
                                    {updateUserMutation.isPending ? "Salvando..." : "Salvar Designações"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}