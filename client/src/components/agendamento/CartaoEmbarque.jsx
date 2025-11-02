import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MapPin, Clock, Bus, Users, Download, CheckCircle, ArrowRight, ArrowLeft, ArrowLeftRight } from "lucide-react";

export default function CartaoEmbarque({ agendamento, evento }) {
    const handleDownload = () => {
        window.print();
    };

    const tipoViagemIcons = {
        ida_volta: <ArrowLeftRight className="w-5 h-5" />,
        somente_ida: <ArrowRight className="w-5 h-5" />,
        somente_volta: <ArrowLeft className="w-5 h-5" />
    };

    const tipoViagemTexto = {
        ida_volta: "Ida e Volta",
        somente_ida: "Somente Ida",
        somente_volta: "Somente Volta"
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* * ADICIONADA A CLASSE 'print-card-clean' AQUI
              * para formatar este card especificamente para impressão.
            */}
            <Card className="overflow-hidden shadow-2xl border-none bg-white print-card-clean">
                <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>

                <CardContent className="p-0">
                    {/* Header do Cartão */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <Bus className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold">Cartão de Embarque</h2>
                                        <p className="text-blue-100">Eventos Cristãos</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <p className="text-xs text-blue-100 uppercase">Número do Cartão</p>
                                    <p className="text-2xl font-bold tracking-wider">{agendamento.numero_cartao}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="flex items-center gap-3">
                                {tipoViagemIcons[agendamento.tipo_viagem]}
                                <div>
                                    <p className="text-xs text-blue-100">Tipo de Viagem</p>
                                    <p className="font-semibold">{tipoViagemTexto[agendamento.tipo_viagem]}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5" />
                                <div>
                                    <p className="text-xs text-blue-100">Data</p>
                                    <p className="font-semibold">
                                        {format(new Date(evento.data_inicio), "dd/MM/yyyy", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5" />
                                <div>
                                    <p className="text-xs text-blue-100">Saída</p>
                                    <p className="font-semibold">{evento.horario_saida}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Corpo do Cartão */}
                    <div className="p-8 space-y-6">
                        {/* Informações do Evento */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-200">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <CheckCircle className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-2xl text-gray-900 mb-3">{evento.nome}</h3>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <p className="font-medium">{evento.local}</p>
                                    </div>
                                    {evento.endereco && (
                                        <p className="text-sm text-gray-600 mt-1 ml-7">{evento.endereco}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Responsável */}
                            <div className="border-2 border-blue-100 rounded-xl p-6 bg-white">
                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Responsável
                                </h4>
                                <div className="space-y-2">
                                    <p className="font-semibold text-gray-900 text-lg">{agendamento.responsavel.nome_completo}</p>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p><span className="font-medium">Doc:</span> {agendamento.responsavel.documento}</p>
                                        <p><span className="font-medium">Tel:</span> {agendamento.responsavel.telefone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="border-2 border-green-100 rounded-xl p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-bold text-green-700 text-xl">CONFIRMADO</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Reserva confirmada para {agendamento.assentos.length} {agendamento.assentos.length === 1 ? 'passageiro' : 'passageiros'}
                                </p>
                            </div>
                        </div>

                        {/* Assentos Reservados */}
                        <div className="border-2 border-blue-100 rounded-xl p-6 bg-white">
                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                                <Bus className="w-5 h-5 text-blue-600" />
                                Assentos Reservados
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {agendamento.assentos.map((assento, idx) => {
                                    const passageiro = agendamento.passageiros.find(p => p.nome_completo === assento.passageiro);
                                    return (
                                        <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200 flex justify-between items-center">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{assento.passageiro}</p>
                                                <p className="text-sm text-gray-600">Doc: {passageiro?.documento}</p>
                                                {passageiro?.idade && (
                                                    <p className="text-xs text-gray-500">{passageiro.idade} anos</p>
                                                )}
                                            </div>
                                            <div className="text-center bg-white rounded-lg px-4 py-2 border-2 border-blue-300 shadow-sm">
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Ônibus</p>
                                                <p className="text-lg font-bold text-blue-600">#{assento.onibus}</p>
                                                <p className="text-xs text-gray-500">Assento</p>
                                                <p className="text-2xl font-bold text-indigo-600">{assento.assento}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Instruções */}
                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                ⚠️ Instruções Importantes
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Apresente este cartão impresso ou digital no momento do embarque</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Chegue com <strong>30 minutos de antecedência</strong> ao horário de saída</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Tenha em mãos documento de identificação com foto</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Em caso de dúvidas, entre em contato com o responsável pelo evento</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 text-center">
                        <p className="font-semibold mb-1">Tenha uma excelente viagem! 🙏</p>
                        <p className="text-sm text-blue-100">Sistema de Agendamento de Eventos</p>
                    </div>
                </CardContent>
            </Card>

            <Button
                onClick={handleDownload}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 no-print"
                size="lg"
            >
                <Download className="w-5 h-5 mr-2" />
                Imprimir Cartão de Embarque
            </Button>
        </div>
    );
}