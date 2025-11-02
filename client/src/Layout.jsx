// client/src/Layout.jsx
import React from "react";
// 1. Importar useNavigate
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import * as apiClient from './api/apiClient';
// 2. Importar useMutation e useQueryClient
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; 
import { 
  LayoutDashboard, Calendar, Search, Users, MapIcon, Settings, Shield,
  User, LogOut, Sun, Moon, ChevronUp, 
  Computer // 3. Importar ícone 'Computer'
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel
} from '@/components/ui/sidebar';
// 4. Importar o hook de Tema
import { useTheme } from "@/hooks/useTheme"; 

// Definições dos módulos e URLs (restauradas)
const moduloEventos = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard,
    requiredDesignacoes: ['gestor_eventos','visualizador_eventos','operador_mapeamento'] },
  { title: "Gerenciar Reservas", url: "/gerenciar", icon: Settings,
    requiredDesignacoes: ['gestor_eventos','operador_mapeamento'] },
  { title: "Mapeamento", url: "/mapeamento", icon: MapIcon,
    requiredDesignacoes: ['gestor_eventos','visualizador_eventos','operador_mapeamento'] },
  { title: "Agendar Viagem", url: "/agendamento", icon: Calendar, public: true },
  { title: "Consultar Reserva", url: "/consulta", icon: Search, public: true },
];

const adminUrl = "/configuracao-acesso";

export default function Layout() {
  const location = useLocation();
  
  // 5. Configurar hooks
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme(); // Hook de Tema

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: apiClient.getMe,
    retry: false,
  });

  // 6. Configurar a Mutation de Logout
  const logoutMutation = useMutation({
    mutationFn: apiClient.logout, // Assumindo que você tem apiClient.logout
    onSuccess: () => {
      // Limpa todo o cache do React Query
      queryClient.invalidateQueries(); 
      // Redireciona para a página de login (assumindo /login)
      navigate("/login"); 
    },
    onError: (error) => {
      console.error("Erro ao fazer logout:", error);
    }
  });

  // 7. Atualizar a função handleLogout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Lógica de acesso (restaurada)
  const hasAccess = (item) => {
    if (item.public) return true;
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    const userDesignacoes = currentUser.designacoes || [];
    return item.requiredDesignacoes?.some(d => userDesignacoes.includes(d));
  };

  const visibleItems = moduloEventos.filter(hasAccess);
  const showAdminLink = currentUser?.role === 'admin';

  return (
    <SidebarProvider>
      {/* Container principal com classes 'dark' */}
      <div className="h-screen flex w-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-gray-900 dark:from-gray-800 dark:to-gray-900">
        
        {/* Sidebar com classes 'dark' */}
        <Sidebar className="dark:bg-gray-950 dark:border-gray-800">
          
          {/* Usando o cabeçalho com ícone 'Users' */}
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg dark:text-white">OurAssist</h2>
                <p className="text-xs text-blue-600 font-medium dark:text-blue-400">Sistema de Gestão</p>
              </div>
            </div>
          </SidebarHeader>

          {/* Conteúdo com classes 'dark' */}
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="dark:text-gray-500">
                Eventos
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        to={item.url}
                        icon={item.icon}
                        active={location.pathname === item.url}
                      >
                        {item.title}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {showAdminLink && (
              <SidebarGroup>
                <SidebarGroupLabel className="dark:text-gray-500">
                  Administração
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        to={adminUrl}
                        icon={Shield}
                        active={location.pathname === adminUrl}
                      >
                        Controle de Acesso
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          {/* Rodapé com dropdown funcional e classes 'dark' */}
          <SidebarFooter className="dark:border-gray-800">
            <Dropdown>
              <DropdownTrigger>
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {currentUser?.full_name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate dark:text-gray-100">
                      {currentUser?.full_name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate dark:text-gray-400">
                      {currentUser?.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </p>
                  </div>
                  <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
              </DropdownTrigger>
              
              <DropdownContent className="dark:bg-gray-900 dark:border-gray-800">
                <DropdownItem 
                  icon={User} 
                  to="/meu-perfil"
                  className="dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Meu Perfil
                </DropdownItem>
                <DropdownSeparator className="dark:bg-gray-800" />
                <DropdownLabel className="dark:text-gray-500">Tema</DropdownLabel>
                <DropdownItem 
                  icon={Sun} 
                  onClick={() => setTheme('light')}
                  className={theme === 'light' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'dark:text-gray-300 dark:hover:bg-gray-800'}
                >
                  Claro
                </DropdownItem>
                <DropdownItem 
                  icon={Moon} 
                  onClick={() => setTheme('dark')}
                  className={theme === 'dark' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'dark:text-gray-300 dark:hover:bg-gray-800'}
                >
                  Escuro
                </DropdownItem>
                <DropdownItem 
                  icon={Computer} 
                  onClick={() => setTheme('system')}
                  className={theme === 'system' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'dark:text-gray-300 dark:hover:bg-gray-800'}
                >
                  Sistema
                </DropdownItem>
                <DropdownSeparator className="dark:bg-gray-800" />
                <DropdownItem 
                  icon={LogOut} 
                  onClick={handleLogout} 
                  disabled={logoutMutation.isPending}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/50 dark:hover:text-red-400"
                >
                  {logoutMutation.isPending ? "Saindo..." : "Sair"}
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </SidebarFooter>
        </Sidebar>

        {/* Conteúdo principal com 'ml-64' e classes 'dark' */}
        <main className="flex-1 flex flex-col ml-64 h-screen"> {/* ml-64 = largura da sidebar */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 px-6 py-4 md:hidden sticky top-0 z-10 dark:bg-gray-900/80 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-xl transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">OurAssist</h1>
            </div>
          </header>

          {/* O Outlet agora rola independentemente */}
          <div className="flex-1 overflow-auto">
            <Outlet />  {/* <- páginas renderizam aqui */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}