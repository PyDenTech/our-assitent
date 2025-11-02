import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, FileText, CreditCard, Bus, ArrowRight, ArrowLeft, ArrowLeftRight, Phone, Users, ShieldAlert, Calendar } from "lucide-react";

// NOVO: Função auxiliar para formatar documentos (CPF)
const formatDocumento = (doc) => {
    if (!doc || doc === "NÃO INFORMADO") return "Não Informado";
    // Remove tudo que não é dígito
    const digitos = doc.replace(/\D/g, "");
    if (digitos.length === 11) {
        return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"); // Formato CPF
    }
    // Retorna RG ou outros formatos como estão
    return doc;
};

// ===================================================================
// Layout de Lista (para printMode={true} - "Todos os Ônibus")
// ===================================================================
const ListView = ({ assentos, tipoViagemIcons, tipoViagemTexto, tipoViagemColors }) => {
    return (
        // NOVO: Esta é a visualização otimizada para impressão e para a lista "Todos os Ônibus".
        // Usamos uma tabela para clareza na impressão.
        <div className="overflow-x-auto print-card-clean bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assento</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passageiro</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cartão/Viagem</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {assentos.map((assento, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                <p className="text-2xl font-bold text-blue-600">{assento.assento}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm font-semibold text-gray-900">{assento.passageiro_nome}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {assento.passageiro_idade && (
                                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                                            <Calendar className="w-3 h-3" /> {assento.passageiro_idade} anos
                                        </Badge>
                                    )}
                                    {assento.passageiro_parentesco && assento.passageiro_parentesco !== "proprio" && (
                                        <Badge variant="outline" className="flex items-center gap-1 text-xs capitalize">
                                            <Users className="w-3 h-3" /> {assento.passageiro_parentesco}
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm text-gray-700">{formatDocumento(assento.passageiro_doc)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm text-gray-900">{assento.responsavel_nome}</p>
                                <p className="text-sm text-gray-500">{assento.responsavel_tel}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="text-xs bg-gray-100 border-gray-300">
                                    {assento.numero_cartao}
                                </Badge>
                                <Badge className={`text-xs flex items-center gap-1 mt-1 ${tipoViagemColors[assento.tipo_viagem]}`}>
                                    {tipoViagemIcons[assento.tipo_viagem]}
                                    {tipoViagemTexto[assento.tipo_viagem]}
                                </Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ===================================================================
// Layout de Card (para printMode={false} - Filtro de 1 ônibus)
// ===================================================================
const CardView = ({ assentos, onibusNumero, tipoViagemIcons, tipoViagemTexto, tipoViagemColors }) => {
    return (
        // ATUALIZADO: Este é o seu layout original, agora melhorado com mais dados.
        <Card className="shadow-xl border-2 border-blue-200 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
                <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="w-6 h-6" />
                    Lista de Passageiros {onibusNumero && `- Ônibus ${onibusNumero}`}
                </CardTitle>
                <p className="text-sm text-blue-100 font-medium mt-2">
                    Total: {assentos.length} {assentos.length === 1 ? 'passageiro' : 'passageiros'}
                </p>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {assentos.map((assento, idx) => (
                        <div
                            key={idx}
                            className="flex flex-col sm:flex-row items-stretch justify-between p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all hover:border-blue-300"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <User className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-gray-900 truncate text-lg">{assento.passageiro_nome}</p>
                                    
                                    {/* DADOS ATUALIZADOS */}
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <span className="text-sm text-gray-600 flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-200">
                                            <ShieldAlert className="w-3 h-3" />
                                            {formatDocumento(assento.passageiro_doc)}
                                        </span>
                                        {assento.passageiro_idade && (
                                            <Badge variant="outline" className="text-xs bg-white border-gray-300 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" /> {assento.passageiro_idade} anos
                                            </Badge>
                                        )}
                                        {assento.passageiro_parentesco && assento.passageiro_parentesco !== "proprio" && (
                                            <Badge variant="outline" className="text-xs bg-white border-gray-300 capitalize flex items-center gap-1">
                                                <Users className="w-3 h-3" /> {assento.passageiro_parentesco}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline" className="text-xs bg-white border-gray-300">
                                            {assento.numero_cartao}
                                        </Badge>
                                        <Badge className={`text-xs flex items-center gap-1 ${tipoViagemColors[assento.tipo_viagem]}`}>
                                            {tipoViagemIcons[assento.tipo_viagem]}
                                            {tipoViagemTexto[assento.tipo_viagem]}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-blue-100">
                                         <p className="text-xs text-gray-700 font-semibold">Responsável: {assento.responsavel_nome}</p>
                                         <p className="text-xs text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3"/> {assento.responsavel_tel}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center bg-white rounded-2xl px-6 py-3 border-2 border-blue-300 shadow-md ml-0 sm:ml-4 mt-4 sm:mt-0 flex-shrink-0">
                                <div className="flex items-center justify-center gap-2 text-gray-500 mb-1">
                                    <Bus className="w-4 h-4" />
                                    <p className="text-xs font-semibold uppercase">Ônibus</p>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">#{assento.onibus}</p>
                                <p className="text-xs text-gray-500 mt-1">ASSENTO</p>
                                <p className="text-3xl font-bold text-indigo-600">{assento.assento}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

// ===================================================================
// Componente Principal
// ===================================================================
export default function LegendaPassageiros({ assentosOcupados, onibusNumero, printMode = false }) {
    
    // NOVO: A lógica de filtro agora usa onibusNumero (que é obrigatório)
    const assentosFiltrados = onibusNumero
        ? assentosOcupados.filter(a => a.onibus === onibusNumero)
        : assentosOcupados; // Fallback caso onibusNumero não seja passado

    // NOVO: A ordenação agora é só por assento, já que o ônibus é único
    const assentosOrdenados = [...assentosFiltrados].sort((a, b) => a.assento - b.assento);

    // Helpers (seu código original)
    const tipoViagemIcons = {
        ida_volta: <ArrowLeftRight className="w-4 h-4" />,
        somente_ida: <ArrowRight className="w-4 h-4" />,
        somente_volta: <ArrowLeft className="w-4 h-4" />
    };
    const tipoViagemTexto = {
        ida_volta: "Ida e Volta",
        somente_ida: "Só Ida",
        somente_volta: "Só Volta"
    };
    const tipoViagemColors = {
        ida_volta: "bg-blue-100 text-blue-800 border-blue-300",
        somente_ida: "bg-green-100 text-green-800 border-green-300",
        somente_volta: "bg-purple-100 text-purple-800 border-purple-300"
    };
    
    // Estado de "Vazio"
    if (assentosOrdenados.length === 0) {
        // Renderiza um placeholder simples (funciona bem em ambos os modos)
        return (
            <div className="text-center py-16 text-gray-500 bg-white rounded-lg border border-gray-200">
                <User className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Nenhum passageiro neste ônibus</p>
            </div>
        );
    }

    // NOVO: Renderização condicional
    if (printMode) {
        return <ListView 
            assentos={assentosOrdenados} 
            tipoViagemIcons={tipoViagemIcons} 
            tipoViagemTexto={tipoViagemTexto} 
            tipoViagemColors={tipoViagemColors} 
        />;
    }

    return <CardView 
        assentos={assentosOrdenados} 
        onibusNumero={onibusNumero} 
        tipoViagemIcons={tipoViagemIcons} 
        tipoViagemTexto={tipoViagemTexto} 
        tipoViagemColors={tipoViagemColors} 
    />;
}