import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "@/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Agendamento from "@/pages/Agendamento";
import Consulta from "@/pages/Consulta";
import Mapeamento from "@/pages/Mapeamento";
import Gerenciar from "@/pages/Gerenciar";
import ConfiguracaoAcesso from "@/pages/ConfiguracaoAcesso";

export default function App() {
  return (
    <Routes>
      {/* Página inicial redireciona para login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login fora do layout */}
      <Route path="/login" element={<Login />} />

      {/* Rotas protegidas dentro do layout */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/consulta" element={<Consulta />} />
        <Route path="/mapeamento" element={<Mapeamento />} />
        <Route path="/gerenciar" element={<Gerenciar />} />
        <Route path="/configuracao-acesso" element={<ConfiguracaoAcesso />} />
      </Route>

      {/* Rota fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
