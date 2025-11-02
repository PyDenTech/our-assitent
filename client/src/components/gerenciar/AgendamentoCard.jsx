import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, User, Bus, Calendar, ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendamentoCard({ agendamento, evento, onEdit, onDelete }) {
    const tipoViagemIcons = {
        ida_volta: <ArrowLeftRight className="w-4 h-4" />,
        somente_ida: <ArrowRight className="w-4 h-4" />,
        somente_volta: <ArrowLeft className="w-4 h-4" />
    };

    const tipoViagemTexto = {
        ida_volta: "Ida e Volta",
        somente_ida: "Somente Ida",
        somente_volta: "Somente Volta"
    };

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-blue-100">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                {agendamento.numero_cartao}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                                {tipoViagemIcons[agendamento.tipo_viagem]}
                                {tipoViagemTexto[agendamento.tipo_viagem]}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{evento?.nome}</h3>
                        <p className="text-sm text-gray-500">
                            {evento && format(new Date(evento.data_inicio), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(agendamento)}>
                            <Edit className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(agendamento.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold text-sm text-gray-700">Responsável</span>
                    </div>
                    <p className="font-medium text-gray-900">{agendamento.responsavel.nome_completo}</p>
                    <p className="text-sm text-gray-600">{agendamento.responsavel.telefone}</p>
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Bus className="w-4 h-4 text-indigo-600" />
                        <span className="font-semibold text-sm text-gray-700">
                            {agendamento.assentos.length} {agendamento.assentos.length === 1 ? 'Assento' : 'Assentos'}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {agendamento.assentos.slice(0, 3).map((assento, idx) => (
                            <Badge key={idx} variant="outline" className="bg-white">
                                Ônibus {assento.onibus} - #{assento.assento}
                            </Badge>
                        ))}
                        {agendamento.assentos.length > 3 && (
                            <Badge variant="outline" className="bg-gray-100">
                                +{agendamento.assentos.length - 3} mais
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}