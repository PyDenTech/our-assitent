
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";

export default function EditarAgendamentoDialog({
    agendamento,
    evento,
    onSave,
    onClose,
    isSaving,
    todosAssentos
}) {
    const [dados, setDados] = useState(agendamento);

    const handleSave = () => {
        onSave(agendamento.id, dados);
    };

    const updatePassageiro = (index, field, value) => {
        const novosPassageiros = [...dados.passageiros];
        novosPassageiros[index] = { ...novosPassageiros[index], [field]: value };
        setDados({ ...dados, passageiros: novosPassageiros });
    };

    const addPassageiro = () => {
        setDados({
            ...dados,
            passageiros: [...dados.passageiros, { nome_completo: "", documento: "", idade: "", parentesco: "" }]
        });
    };

    const removePassageiro = (index) => {
        const novosPassageiros = dados.passageiros.filter((_, i) => i !== index);
        const novosAssentos = dados.assentos.filter((_, i) => i !== index);
        setDados({ ...dados, passageiros: novosPassageiros, assentos: novosAssentos });
    };

    const updateAssento = (index, field, value) => {
        const novosAssentos = [...dados.assentos];
        novosAssentos[index] = { ...novosAssentos[index], [field]: parseInt(value) };
        setDados({ ...dados, assentos: novosAssentos });
    };

    const assentosDisponiveis = (onibusNum, assentoAtual) => {
        const capacidade = evento.capacidade_por_onibus;
        const ocupados = todosAssentos
            .filter(a => a.agendamento_id !== agendamento.id)
            .filter(a => a.onibus === onibusNum)
            .map(a => a.assento);

        // Gerar todos os assentos exceto o 1 (motorista)
        return Array.from({ length: capacidade }, (_, i) => i + 1)
            .filter(num => num !== 1) // Excluir assento do motorista
            .filter(num => num === assentoAtual || !ocupados.includes(num));
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Editar Agendamento</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="responsavel" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="responsavel">Responsável</TabsTrigger>
                        <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
                        <TabsTrigger value="assentos">Assentos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="responsavel" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Tipo de Viagem</Label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant={dados.tipo_viagem === "ida_volta" ? "default" : "outline"}
                                    onClick={() => setDados({ ...dados, tipo_viagem: "ida_volta" })}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeftRight className="w-4 h-4" />
                                    Ida e Volta
                                </Button>
                                <Button
                                    type="button"
                                    variant={dados.tipo_viagem === "somente_ida" ? "default" : "outline"}
                                    onClick={() => setDados({ ...dados, tipo_viagem: "somente_ida" })}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                    Só Ida
                                </Button>
                                <Button
                                    type="button"
                                    variant={dados.tipo_viagem === "somente_volta" ? "default" : "outline"}
                                    onClick={() => setDados({ ...dados, tipo_viagem: "somente_volta" })}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Só Volta
                                </Button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nome Completo</Label>
                                <Input
                                    value={dados.responsavel.nome_completo}
                                    onChange={(e) => setDados({
                                        ...dados,
                                        responsavel: { ...dados.responsavel, nome_completo: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>CPF/RG</Label>
                                <Input
                                    value={dados.responsavel.documento}
                                    onChange={(e) => setDados({
                                        ...dados,
                                        responsavel: { ...dados.responsavel, documento: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                    value={dados.responsavel.telefone}
                                    onChange={(e) => setDados({
                                        ...dados,
                                        responsavel: { ...dados.responsavel, telefone: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>E-mail</Label>
                                <Input
                                    value={dados.responsavel.email || ""}
                                    onChange={(e) => setDados({
                                        ...dados,
                                        responsavel: { ...dados.responsavel, email: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="passageiros" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Passageiros</h3>
                            <Button onClick={addPassageiro} size="sm" variant="outline">
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Passageiro
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {dados.passageiros.map((passageiro, idx) => (
                                <div key={idx} className="p-4 bg-blue-50 rounded-lg space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium">Passageiro {idx + 1}</h4>
                                        {dados.passageiros.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removePassageiro(idx)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Nome Completo</Label>
                                            <Input
                                                value={passageiro.nome_completo}
                                                onChange={(e) => updatePassageiro(idx, "nome_completo", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>CPF/RG</Label>
                                            <Input
                                                value={passageiro.documento}
                                                onChange={(e) => updatePassageiro(idx, "documento", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Idade</Label>
                                            <Input
                                                type="number"
                                                value={passageiro.idade || ""}
                                                onChange={(e) => updatePassageiro(idx, "idade", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Parentesco</Label>
                                            <Select
                                                value={passageiro.parentesco}
                                                onValueChange={(v) => updatePassageiro(idx, "parentesco", v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
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
                        </div>
                    </TabsContent>

                    <TabsContent value="assentos" className="space-y-4">
                        <h3 className="font-semibold">Assentos e Posições</h3>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <p className="text-xs text-yellow-800">
                                ⚠️ <strong>Atenção:</strong> A poltrona 1 é reservada para o motorista e não pode ser selecionada.
                            </p>
                        </div>
                        <div className="space-y-3">
                            {dados.assentos.map((assento, idx) => (
                                <div key={idx} className="p-4 bg-blue-50 rounded-lg">
                                    <div className="grid md:grid-cols-3 gap-4 items-end">
                                        <div className="space-y-2">
                                            <Label>Passageiro</Label>
                                            <Input value={assento.passageiro} disabled className="bg-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Ônibus</Label>
                                            <Select
                                                value={assento.onibus.toString()}
                                                onValueChange={(v) => updateAssento(idx, "onibus", v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: evento.quantidade_onibus }, (_, i) => (
                                                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                                                            Ônibus {i + 1}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Assento</Label>
                                            <Select
                                                value={assento.assento.toString()}
                                                onValueChange={(v) => updateAssento(idx, "assento", v)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {assentosDisponiveis(assento.onibus, assento.assento).map(num => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            Assento {num}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
