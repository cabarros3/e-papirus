'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  BookPlus,
  Repeat,
  RotateCcw,
  CalendarDays,
  HandHelping,
  Users2,
  Tags,
  Search,
  BookMarked,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  UserPlus,
  SquareLibrary,
  BookCopy,
  BookUp,
  BookUp2,
  BookDown,
  CalendarPlus2,
  ClipboardPen,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { Pessoa } from '@/types/pessoas';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Sidebar inicia sempre fechada (true)
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<Pessoa | null>(null);

  // Estados dos Submenus
  const [openAcervo, setOpenAcervo] = useState(false);
  const [openItens, setOpenItens] = useState(false);
  const [openCirculacao, setOpenCirculacao] = useState(false);
  const [openEmprestimoMenu, setOpenEmprestimoMenu] = useState(false);
  const [openReservaMenu, setOpenReservaMenu] = useState(false);
  const [openUsuarios, setOpenUsuarios] = useState(false);

  useEffect(() => {
    const identifier = window.requestAnimationFrame(() => {
      const saved = sessionStorage.getItem('bib_user');
      const token = sessionStorage.getItem('bib_token');

      if (!saved || !token) {
        router.push('/login');
        return;
      }

      try {
        setUser(JSON.parse(saved));
        setIsReady(true);
      } catch (error) {
        router.push('/login');
      }
    });
    return () => window.cancelAnimationFrame(identifier);
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem('bib_token');
    sessionStorage.removeItem('bib_user');
    router.push('/login');
  };

  if (!isReady || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-denin" size={32} />
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside
        className={`${
          isCollapsed ? 'w-24' : 'w-72'
        } bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        <div
          className={`h-20 border-b border-gray-100 flex items-center px-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
          >
            <div className="text-2xl font-bold text-black whitespace-nowrap">
              <Link href={'/'}>
                <span className="text-denin">e</span>-Papirus
              </Link>
              
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-denin transition-colors shrink-0"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={24} />
            ) : (
              <PanelLeftClose size={24} />
            )}
          </button>
        </div>

        <nav className="grow p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          <NavItem
            href="/dashboard/staff"
            icon={<LayoutDashboard size={20} />}
            label="Painel"
            active={isActive('/dashboard/staff')}
            collapsed={isCollapsed}
          />

          {/* MENU: GERENCIAR ACERVO */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenAcervo(!openAcervo);
              }}
              title={isCollapsed ? 'Acervo' : ''}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3">
                <SquareLibrary size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                >
                  Acervo
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openAcervo ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {openAcervo && !isCollapsed && (
              <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1">
                <button
                  onClick={() => setOpenItens(!openItens)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-gray-600 hover:text-denin transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookMarked size={18} />
                    <span className="text-sm font-bold tracking-wide">
                      Itens
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openItens ? 'rotate-180' : ''}`}
                  />
                </button>
                {openItens && (
                  <div className="ml-4 space-y-1">
                    <SubNavItem
                      href="/dashboard/staff/consulta-acervo"
                      icon={<Search size={16} />}
                      label="Consulta ao Acervo"
                    />
                    <SubNavItem
                      href="/dashboard/staff/cadastrar-item"
                      icon={<BookPlus size={16} />}
                      label="Novo Item"
                    />
                    <SubNavItem
                      href="/dashboard/staff/cadastrar-exemplar"
                      icon={<BookCopy size={16} />}
                      label="Exemplares"
                    />
                  </div>
                )}
                <SubNavItem
                  href="/dashboard/staff/autores"
                  icon={<Users2 size={18} />}
                  label="Autores"
                />
                <SubNavItem
                  href="/dashboard/staff/assuntos"
                  icon={<Tags size={18} />}
                  label="Assuntos"
                />
              </div>
            )}
          </div>

          {/* MENU: CIRCULAÇÃO */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenCirculacao(!openCirculacao);
              }}
              title={isCollapsed ? 'Circulação' : ''}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3">
                <HandHelping size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                >
                  Circulação
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openCirculacao ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {openCirculacao && !isCollapsed && (
              <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1 font-medium">
                {/* SUBMENU: EMPRÉSTIMOS */}
                <button
                  onClick={() => setOpenEmprestimoMenu(!openEmprestimoMenu)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-gray-600 hover:text-denin transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BookUp size={18} />
                    <span className="text-sm font-bold tracking-wide">
                      Empréstimos
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openEmprestimoMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                {openEmprestimoMenu && (
                  <div className="ml-4 border-l-2 border-gray-100 space-y-1 flex-w">
                    <SubNavItem
                      href="/dashboard/staff/listar-emprestimos"
                      icon={<ClipboardPen size={16} />}
                      label="Ver Empréstimos"
                    />
                    <SubNavItem
                      href="/dashboard/staff/emprestimo"
                      icon={<BookUp2 size={16} />}
                      label="Novo Empréstimo"
                    />
                  </div>
                )}

                {/* <SubNavItem
                  href="/dashboard/staff/devolucao"
                  icon={<RotateCcw size={18} />}
                  label="Devolução"
                /> */}
                
                <SubNavItem
                  href="/dashboard/staff/Renovacao"
                  icon={<Repeat size={18} />}
                  label="Renovação"
                />
                <SubNavItem
                  href="/dashboard/staff/devolucao"
                  icon={<BookDown size={18} />}
                  label="Devolução"
                />

                {/* SUBMENU: RESERVAS */}
                <button
                  onClick={() => setOpenReservaMenu(!openReservaMenu)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-gray-600 hover:text-denin transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />
                    <span className="text-sm font-bold tracking-wide">
                      Reservas
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openReservaMenu ? 'rotate-180' : ''}`}
                  />
                </button>
                {openReservaMenu && (
                  <div className="ml-4 border-l-2 border-gray-100 space-y-1">
                    <SubNavItem
                      href="/dashboard/staff/listar-reservas"
                      icon={<ClipboardPen size={16} />}
                      label="Ver Reservas"
                    />
                    <SubNavItem
                      href="/dashboard/staff/cadastrar-reservas"
                      icon={<CalendarPlus2 size={16} />}
                      label="Nova Reserva"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MENU: USUÁRIOS (AJUSTADO) */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenUsuarios(!openUsuarios);
              }}
              title={isCollapsed ? 'Usuários' : ''}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${isCollapsed ? 'justify-center' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3">
                <Users size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                >
                  Usuários
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openUsuarios ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {openUsuarios && !isCollapsed && (
              <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1 font-medium">
                <SubNavItem
                  href="/dashboard/staff/listar-usuarios"
                  icon={<ClipboardPen size={18} />}
                  label="Ver Usuários"
                />
                <SubNavItem
                  href="/dashboard/staff/cadastrar-usuario"
                  icon={<UserPlus size={18} />}
                  label="Cadastrar Novo"
                />
              </div>
            )}
          </div>

          <NavItem
            href="#"
            icon={<Settings size={20} />}
            label="Configurações"
            collapsed={isCollapsed}
          />
        </nav>

        {/* FOOTER DA SIDEBAR */}
        <div className="p-6 border-t border-gray-100">
          {isCollapsed ? (
            <div
              title={`Acesso: ${user.tipo || 'STAFF'}`}
              className="w-12 h-12 rounded-full bg-denin/10 text-denin flex items-center justify-center mx-auto text-xs font-black"
            >
              ADM
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center overflow-hidden border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Acesso
              </p>
              <p className="text-sm font-extrabold text-gray-700 truncate">
                {user.tipo || 'Bibliotecário(a)'}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="grow flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div className="text-sm text-gray-500 font-medium italic truncate mr-4">
            Painel Administrativo
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 uppercase leading-none mb-1">
                {user.nome}
              </span>
              <span className="text-xs text-denin font-bold uppercase tracking-widest">
                {user.cargo || user.tipo || 'STAFF'}
              </span>
            </div>

            <div className="group relative">
              <div
                title={user.nome}
                className="w-12 h-12 rounded-full bg-denin flex items-center justify-center text-white text-base font-black cursor-pointer shadow-md hover:scale-105 transition-transform"
              >
                {user.nome.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-5 text-sm text-red-600 hover:bg-red-50 font-black transition-colors"
                >
                  <LogOut size={20} /> Encerrar Sessão
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 grow overflow-y-auto">{children}</div>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}

// COMPONENTES AUXILIARES
function NavItem({ href, icon, label, active, collapsed }: any) {
  return (
    <Link
      href={href}
      title={collapsed ? label : ''}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        active
          ? 'text-denin bg-denin/5 font-bold'
          : 'text-gray-700 hover:text-denin hover:bg-gray-50'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <div className="shrink-0">{icon}</div>
      <span
        className={`text-base font-semibold whitespace-nowrap transition-all duration-200 ${collapsed ? 'opacity-0 w-0 invisible' : 'opacity-100 w-auto visible'}`}
      >
        {label}
      </span>
    </Link>
  );
}

function SubNavItem({ href, icon, label }: any) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 p-3 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${
        active
          ? 'text-denin bg-denin/10'
          : 'text-gray-600 hover:text-denin hover:bg-denin/5'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}
