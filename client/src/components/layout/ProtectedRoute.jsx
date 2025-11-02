// client/src/components/layout/ProtectedRoute.js

import React from "react";
import * as apiClient from '../../api/apiClient'; // <-- CORRIGIDO (sobe 2 níveis)
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from '../../components/ui/card'; // <-- CORRIGIDO (sobe 2 níveis)
import { Lock } from "lucide-react";

export default function ProtectedRoute({ children, requiredDesignacoes = [], requireAdmin = false }) {
    const { data: currentUser, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: apiClient.getMe, // MUDOU
        retry: false,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Se não há usuário, negar acesso
    if (!currentUser) { // MUDOU
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md border-red-200 shadow-xl">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Lock className="w-20 h-20 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
                        <p className="text-gray-600">Você precisa estar logado para acessar esta página.</p>
                        {/* Opcional: Adicionar botão de login */}
                        {/* <Button asChild className="mt-4"><Link to="/login">Fazer Login</Link></Button> */}
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Verificar se é admin quando necessário
    if (requireAdmin && currentUser?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-md border-red-200 shadow-xl">
                    <CardContent className="pt-12 pb-12 text-center">
                        <Lock className="w-20 h-20 text-red-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
                        <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
                        <p className="text-sm text-gray-500 mt-2">É necessário ser administrador.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Verificar designações quando necessário
    if (requiredDesignacoes.length > 0) {
        const userDesignacoes = currentUser.designacoes || [];
        // Admin sempre tem acesso
        const hasPermission = currentUser.role === 'admin' ||
            requiredDesignacoes.some(designacao => userDesignacoes.includes(designacao));

        if (!hasPermission) {
            return (
                <div className="min-h-screen flex items-center justify-center p-6">
                    <Card className="max-w-md border-red-200 shadow-xl">
                        <CardContent className="pt-12 pb-12 text-center">
                            <Lock className="w-20 h-20 text-red-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
                            <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Designação necessária: {requiredDesignacoes.join(' ou ')}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    return children;
}