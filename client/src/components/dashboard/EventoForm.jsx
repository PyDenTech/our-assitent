import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, X } from "lucide-react";

export default function EventoForm({ evento, onSave, onCancel, isSaving }) {
    const [formData, setFormData] = useState(evento || {
        nome: "",
        tipo: "assembleia",
        data_inicio: "",
        data_fim: "",
        horario_saida: "",
        local: "",
        endereco: "",
        descricao: "",
        status: "aberto",
        quantidade_onibus: 1,
        capacidade_por_onibus: 46
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card className="border-blue-100 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <CardTitle>{evento ? "Editar Evento" : "Novo Evento"}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="nome">Nome do Evento *</Label>
                            <Input
                                id="nome"
                                value={formData.nome}
                                onChange={(e) => handleChange("nome", e.target.value)}
                                placeholder="Ex: Assembleia Regional 2025"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo *</Label>
                            <Select value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="assembleia">Assembleia</SelectItem>
                                    <SelectItem value="congresso">Congresso</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status *</Label>
                            <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="aberto">Aberto</SelectItem>
                                    <SelectItem value="fechado">Fechado</SelectItem>
                                    <SelectItem value="cancelado">Cancelado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data_inicio">Data de Início *</Label>
                            <Input
                                id="data_inicio"
                                type="date"
                                value={formData.data_inicio}
                                onChange={(e) => handleChange("data_inicio", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="data_fim">Data de Término</Label>
                            <Input
                                id="data_fim"
                                type="date"
                                value={formData.data_fim}
                                onChange={(e) => handleChange("data_fim", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="horario_saida">Horário de Saída *</Label>
                            <Input
                                id="horario_saida"
                                type="time"
                                value={formData.horario_saida}
                                onChange={(e) => handleChange("horario_saida", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="local">Local do Evento *</Label>
                            <Input
                                id="local"
                                value={formData.local}
                                onChange={(e) => handleChange("local", e.target.value)}
                                placeholder="Ex: Salão do Reino Central"
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="endereco">Endereço Completo</Label>
                            <Input
                                id="endereco"
                                value={formData.endereco}
                                onChange={(e) => handleChange("endereco", e.target.value)}
                                placeholder="Rua, número, bairro, cidade"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="quantidade_onibus">Quantidade de Ônibus *</Label>
                            <Input
                                id="quantidade_onibus"
                                type="number"
                                min="1"
                                value={formData.quantidade_onibus}
                                onChange={(e) => handleChange("quantidade_onibus", parseInt(e.target.value))}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="capacidade_por_onibus">Capacidade por Ônibus *</Label>
                            <Input
                                id="capacidade_por_onibus"
                                type="number"
                                min="1"
                                value={formData.capacidade_por_onibus}
                                onChange={(e) => handleChange("capacidade_por_onibus", parseInt(e.target.value))}
                                required
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="descricao">Descrição</Label>
                            <Textarea
                                id="descricao"
                                value={formData.descricao}
                                onChange={(e) => handleChange("descricao", e.target.value)}
                                placeholder="Informações adicionais sobre o evento"
                                rows={3}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 bg-gray-50">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-blue-500 to-indigo-600">
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}