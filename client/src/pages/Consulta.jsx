import React, { useState } from "react";
// Importa o NOVO apiClient em vez do base44
import * as apiClient from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CartaoEmbarque from "../components/agendamento/CartaoEmbarque";

export default function Consulta() {
    const [termoBusca, setTermoBusca] = useState("");
    const [tipoBusca, setTipoBusca] = useState("numero_cartao");
    const [resultado, setResultado] = useState(null);
    const [buscando, setBuscando] = useState(false);

    // ATUALIZADO: Usando apiClient.listAgendamentos
    const { data: agendamentos } = useQuery({
        queryKey: ['agendamentos'],
        queryFn: apiClient.listAgendamentos, // <-- MUDOU
        initialData: [],
    });

    // ATUALIZADO: Usando apiClient.listEventos
    const { data: eventos } = useQuery({
        queryKey: ['eventos'],
        queryFn: apiClient.listEventos, // <-- MUDOU
        initialData: [],
    });

    // A lógica de busca local não precisa mudar, pois opera nos 
    // dados 'agendamentos' e 'eventos' já carregados.
    const buscar = () => {
        setBuscando(true);
        setTimeout(() => { // Simula a busca
            let encontrado = null;

            if (tipoBusca === "numero_cartao") {
                encontrado = agendamentos.find(a =>
                    a.numero_cartao.toLowerCase() === termoBusca.toLowerCase()
                );
            } else if (tipoBusca === "nome") {
                encontrado = agendamentos.find(a =>
                    a.responsavel.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()) ||
                    a.passageiros.some(p => p.nome_completo.toLowerCase().includes(termoBusca.toLowerCase()))
                );
            } else if (tipoBusca === "documento") {
                encontrado = agendamentos.find(a =>
                    a.responsavel.documento === termoBusca ||
                    a.passageiros.some(p => p.documento === termoBusca)
                );
            }

            setResultado(encontrado);
            setBuscando(false);
        }, 500);
    };

    const evento = resultado ? eventos.find(e => e.id === resultado.evento_id) : null;

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* 1. ADICIONADO 'no-print' AO CABEÇALHO DA PÁGINA */}
                <div className="no-print">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Consultar Reserva</h1>
                    <p className="text-gray-500 mt-1">Busque seu agendamento por número do cartão, nome ou documento</p>
                </div>

                {/* 2. ADICIONADO 'no-print' AO CARD DE BUSCA */}
                <Card className="border-blue-100 shadow-xl no-print">
                    <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <CardTitle>Buscar Agendamento</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid md:grid-cols-3 gap-4">
                            <Button
                                variant={tipoBusca === "numero_cartao" ? "default" : "outline"}
                                onClick={() => setTipoBusca("numero_cartao")}
                                className={tipoBusca === "numero_cartao" ? "bg-blue-600" : ""}
                            >
                                Nº do Cartão
                            </Button>
                            <Button
                                variant={tipoBusca === "nome" ? "default" : "outline"}
                                onClick={() => setTipoBusca("nome")}
                                className={tipoBusca === "nome" ? "bg-blue-600" : ""}
                            >
                                Nome Completo
                            </Button>
                            <Button
                                variant={tipoBusca === "documento" ? "default" : "outline"}
                                onClick={() => setTipoBusca("documento")}
                                className={tipoBusca === "documento" ? "bg-blue-600" : ""}
                            >
                                CPF/RG
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="busca">
                                {tipoBusca === "numero_cartao" && "Número do Cartão de Embarque"}
                                {tipoBusca === "nome" && "Nome Completo do Passageiro"}
                                {tipoBusca === "documento" && "CPF ou RG"}
                            </Label>
                            <div className="flex gap-3">
                                <Input
                                    id="busca"
                                    value={termoBusca}
                                    onChange={(e) => setTermoBusca(e.target.value)}
                                    placeholder={
                                        tipoBusca === "numero_cartao" ? "Ex: EC12345678" :
                                            tipoBusca === "nome" ? "Ex: João da Silva" :
                                                "Ex: 000.000.000-00"
                                    }
                                    onKeyDown={(e) => e.key === "Enter" && buscar()}
                                />
                                <Button
                                    onClick={buscar}
                                    disabled={!termoBusca || buscando}
                                    className="bg-gradient-to-r from-blue-500 to-indigo-600"
                                >
                                    <Search className="w-5 h-5 mr-2" />
                                    {buscando ? "Buscando..." : "Buscar"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <AnimatePresence mode="wait">
                    {resultado && evento ? (
                        <motion.div
                            key="resultado"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            {/* Este componente já tem 'print-card-clean' nele */}
                            <CartaoEmbarque agendamento={resultado} evento={evento} />
                        </motion.div>
                    ) : termoBusca && !buscando && !resultado ? (
                        <motion.div
                            key="nao-encontrado"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* 3. ADICIONADO 'no-print' AO CARD DE "NÃO ENCONTRADO" */}
                            <Card className="border-blue-100 no-print">
                                <CardContent className="py-12 text-center">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Nenhum agendamento encontrado</p>
                                    <p className="text-gray-400 text-sm mt-2">Verifique os dados e tente novamente</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
}