
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function EventoCard({ evento, onEdit, onDelete, agendamentos }) {
    const totalAssentos = evento.quantidade_onibus * (evento.capacidade_por_onibus - 1); // Descontando motorista
    const assentosOcupados = agendamentos.filter(a => a.evento_id === evento.id)
        .reduce((acc, a) => acc + a.assentos.length, 0);
    const percentualOcupacao = totalAssentos > 0 ? (assentosOcupados / totalAssentos) * 100 : 0; // Handle division by zero

    const statusColors = {
        aberto: "bg-green-100 text-green-800 border-green-200",
        fechado: "bg-red-100 text-red-800 border-red-200",
        cancelado: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const tipoColors = {
        assembleia: "bg-blue-100 text-blue-800 border-blue-200",
        congresso: "bg-purple-100 text-purple-800 border-purple-200",
        outro: "bg-orange-100 text-orange-800 border-orange-200"
    };

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-blue-100">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{evento.nome}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <Badge className={tipoColors[evento.tipo]} variant="outline">
                                {evento.tipo}
                            </Badge>
                            <Badge className={statusColors[evento.status]} variant="outline">
                                {evento.status}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(evento)}>
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(evento.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>{format(new Date(evento.data_inicio), "dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{evento.horario_saida}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 col-span-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="truncate">{evento.local}</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-blue-100">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Ocupação</span>
                        <span className="text-sm font-bold text-blue-600">
                            {assentosOcupados}/{totalAssentos}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentualOcupacao}%` }}
                        />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span>{evento.quantidade_onibus} ônibus · {evento.capacidade_por_onibus - 1} assentos cada</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
