'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookMarked,
  Search,
  LogOut,
  Loader2,
  ChevronDown,
  PlusCircle,
  List,
  Library,
  IdCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { Pessoa } from '@/types/pessoas';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<Pessoa | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [reservaSubmenuOpen, setReservaSubmenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

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

  if (!isReady || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <Loader2 className="animate-spin text-denin dark:text-vivid-sky" size={32} />
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors">
      <Toaster richColors position="top-right" theme="system" />
      <aside
        className={`${
          isCollapsed ? 'w-24' : 'w-72'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        <div
          className={`h-20 border-b border-gray-100 dark:border-slate-800 flex items-center px-6 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}
          >
            <div className="text-2xl font-bold text-black dark:text-white whitespace-nowrap transition-colors">
              <Link href={'/'}>
                <span className="text-denin dark:text-vivid-sky">e</span>-Papirus
              </Link>
            </div>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg text-gray-400 hover:text-denin dark:hover:text-vivid-sky transition-colors shrink-0"
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
            href="/dashboard/user"
            icon={<LayoutDashboard size={20} />}
            label="Painel"
            active={isActive('/dashboard/user')}
            collapsed={isCollapsed}
          />
          <NavItem
            href="/dashboard/user/consultar-acervo"
            icon={<Search size={20} />}
            label="Acervo"
            active={isActive('/dashboard/user/consultar-acervo')}
            collapsed={isCollapsed}
          />
          <NavItem
            href="/dashboard/user/meus-emprestimos"
            icon={<Library size={20} />}
            label="Meus empréstimos"
            active={isActive('/dashboard/user/meus-emprestimos')}
            collapsed={isCollapsed}
          />

          {/* Menu Reservas */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setReservaSubmenuOpen(!reservaSubmenuOpen);
              }}
              title={isCollapsed ? 'Reservas' : ''}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookMarked size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}
                >
                  Reservas
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${reservaSubmenuOpen ? 'rotate-180' : ''}`}
                />
              )}
            </button>

            {reservaSubmenuOpen && !isCollapsed && (
              <div className="ml-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800 space-y-1 mt-1 font-medium">
                <SubNavItem
                  href="/dashboard/user/nova-reserva"
                  icon={<PlusCircle size={16} />}
                  label="Nova Reserva"
                />
                <SubNavItem
                  href="/dashboard/user/minhas-reservas"
                  icon={<List size={16} />}
                  label="Minhas Reservas"
                />
              </div>
            )}
          </div>

          <NavItem
            href="/dashboard/user/perfil"
            icon={<IdCard size={20} />}
            label="Dados Pessoais"
            active={isActive('/dashboard/user/perfil')}
            collapsed={isCollapsed}
          />
        </nav>

        {/* FOOTER DA SIDEBAR */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-800">
          {isCollapsed ? (
            <div
              title={`Acesso: ${user.tipo || 'STAFF'}`}
              className="w-12 h-12 rounded-full bg-denin/10 dark:bg-denin/20 text-denin dark:text-vivid-sky flex items-center justify-center mx-auto text-xs font-black"
            >
              ADM
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4 text-center overflow-hidden border border-gray-100 dark:border-slate-700">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                Acesso
              </p>
              <p className="text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase truncate">
                {user.tipo || 'Bibliotecário(a)'}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="grow flex flex-col min-w-0">
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-10 shadow-sm transition-colors">
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium italic truncate mr-4">
            Olá, <span className="text-denin dark:text-vivid-sky font-semibold">{user.nome}</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <ThemeToggle />

            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 dark:text-white uppercase leading-none mb-1">
                {user.nome}
              </span>
              <span className="text-xs text-denin dark:text-vivid-sky font-bold uppercase tracking-widest">
                {user.tipo || 'USUÁRIO'}
              </span>
            </div>

            <div className="group relative">
              <button
                type="button"
                title="Acessar meu perfil"
                aria-label="Acessar meu perfil"
                onClick={() => router.push('/dashboard/user/perfil')}
                className="w-12 h-12 rounded-full bg-denin dark:bg-vivid-sky flex items-center justify-center text-white text-base font-black cursor-pointer shadow-md hover:scale-105 transition-transform"
              >
                {user.nome.substring(0, 2).toUpperCase()}
              </button>

              <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button
                  onClick={() => {
                    sessionStorage.clear();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-3 p-5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 font-black transition-colors"
                >
                  <LogOut size={20} /> Encerrar Sessão
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 grow overflow-y-auto transition-colors">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label, active, collapsed }: any) {
  return (
    <Link
      href={href}
      title={collapsed ? label : ''}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        active
          ? 'text-denin dark:text-vivid-sky bg-denin/5 dark:bg-vivid-sky/10 font-bold'
          : 'text-gray-700 dark:text-gray-300 hover:text-denin dark:hover:text-vivid-sky hover:bg-gray-50 dark:hover:bg-slate-800'
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
          ? 'text-denin dark:text-vivid-sky bg-denin/10 dark:bg-vivid-sky/20'
          : 'text-gray-600 dark:text-gray-400 hover:text-denin dark:hover:text-vivid-sky hover:bg-denin/5 dark:hover:bg-slate-800'
      }`}
    >
      <div className="shrink-0">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}