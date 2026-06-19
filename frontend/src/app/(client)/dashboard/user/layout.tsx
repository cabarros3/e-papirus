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
  ChevronRight,
  PlusCircle,
  List,
  Library,
  HistoryIcon,
  IdCard,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { Toaster } from 'sonner';
import { Pessoa } from '@/types/pessoas';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-denin" size={32} />
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster richColors position="top-right" />
      <aside
        className={`${
          isCollapsed ? 'w-24' : 'w-72'
        } bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        <div
          className={`h-20 border-b border-gray-100 flex items-center px-6 ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
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
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${
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
              <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1 font-medium">
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
        <div className="p-6 border-t border-gray-100">
          {isCollapsed ? (
            <div
              title={`Matrícula: ${user.matricula || 'N/A'}`}
              className="w-12 h-12 rounded-full bg-denin/10 text-denin flex items-center justify-center mx-auto text-xs font-black"
            >
              {user.matricula?.slice(-2) || 'ID'}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center overflow-hidden border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Matrícula
              </p>
              <p className="text-sm font-extrabold text-gray-700 truncate">
                {user.matricula || 'N/A'}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="grow flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div className="text-sm text-gray-500 font-medium italic truncate mr-4">
            Olá, <span className="text-denin font-semibold">{user.nome}</span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 uppercase leading-none mb-1">
                {user.nome}
              </span>
              <span className="text-xs text-denin font-bold uppercase tracking-widest">
                {user.tipo || 'USUÁRIO'}
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
                  onClick={() => {
                    sessionStorage.clear();
                    router.push('/login');
                  }}
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

// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter, usePathname } from "next/navigation";
// import {
//   LayoutDashboard,
//   BookMarked,
//   Search,
//   LogOut,
//   Bell,
//   Loader2,
//   ChevronDown,
//   ChevronRight,
//   PlusCircle,
//   List,
//   Library,
//   HistoryIcon,
//   IdCard,
// } from "lucide-react";
// import { Pessoa } from "@/types/pessoas";

// export default function ClientDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [user, setUser] = useState<Pessoa | null>(null);
//   const [isReady, setIsReady] = useState(false);

//   // Estado para controlar se o submenu de reservas está aberto
//   const [reservaSubmenuOpen, setReservaSubmenuOpen] = useState(false);

//   useEffect(() => {
//     const identifier = window.requestAnimationFrame(() => {
//       const saved = localStorage.getItem("bib_user");
//       const token = localStorage.getItem("bib_token");

//       if (!saved || !token) {
//         router.push("/login");
//         return;
//       }

//       try {
//         setUser(JSON.parse(saved));
//         setIsReady(true);
//       } catch (error) {
//         router.push("/login");
//       }
//     });

//     return () => window.cancelAnimationFrame(identifier);
//   }, [router]);

//   if (!isReady || !user) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <Loader2 className="animate-spin text-denin" size={32} />
//       </div>
//     );
//   }

//   const isActive = (path: string) => pathname === path;
//   // Verifica se qualquer rota filha de reservas está ativa para destacar o pai
//   const isReservaActive = pathname.includes("/reservas");

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
//         <div className="p-6 border-b border-gray-100 font-bold text-2xl text-denin">
//           e-Papirus
//           <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-medium">
//             Portal do {user.tipo === "professor" ? "Professor" : "Leitor"}
//           </span>
//         </div>

//         <nav className="flex-grow p-4 space-y-1">
//           {/* Início */}
//           <Link
//             href="/dashboard/user"
//             className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
//               isActive("/dashboard")
//                 ? "bg-denin/10 text-denin font-medium"
//                 : "text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             <LayoutDashboard size={18} />
//             <span className="text-sm">Dashboard</span>
//           </Link>

//           {/* Acervo */}
//           <Link
//             href="/resultados"
//             className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
//               isActive("/resultados")
//                 ? "bg-denin/10 text-denin font-medium"
//                 : "text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             <Search size={18} />
//             <span className="text-sm font-medium">Pesquisar no Acervo</span>
//           </Link>

//           <Link
//             href="/resultados"
//             className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
//               isActive("/resultados")
//                 ? "bg-denin/10 text-denin font-medium"
//                 : "text-gray-600 hover:bg-gray-50"
//             }`}
//           >
//             <Library size={18} />
//             <span className="text-sm font-medium">Meus empréstimos</span>
//           </Link>

//           {/* Menu Pai de Reservas */}
//           <div className="space-y-1">
//             <button
//               onClick={() => setReservaSubmenuOpen(!reservaSubmenuOpen)}
//               className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
//                 isReservaActive
//                   ? "text-denin font-medium"
//                   : "text-gray-600 hover:bg-gray-50"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <BookMarked size={18} />
//                 <span className="text-sm">Reservas</span>
//               </div>
//               {reservaSubmenuOpen ? (
//                 <ChevronDown size={14} />
//               ) : (
//                 <ChevronRight size={14} />
//               )}
//             </button>

//             {/* Submenu */}
//             {reservaSubmenuOpen && (
//               <div className="ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1">
//                 <Link
//                   href="/dashboard/user/nova-reserva"
//                   className={`flex items-center gap-3 p-2 rounded-lg text-xs transition-all ${
//                     isActive("/dashboard/user/reservas/nova")
//                       ? "text-denin font-bold"
//                       : "text-gray-500 hover:text-denin"
//                   }`}
//                 >
//                   <PlusCircle size={14} />
//                   Nova Reserva
//                 </Link>
//                 <Link
//                   href="/dashboard/user/minhas-reservas"
//                   className={`flex items-center gap-3 p-2 rounded-lg text-xs transition-all ${
//                     isActive("/dashboard/user/reservas")
//                       ? "text-denin font-bold"
//                       : "text-gray-500 hover:text-denin"
//                   }`}
//                 >
//                   <List size={14} />
//                   Minhas Reservas
//                 </Link>
//               </div>
//             )}

//             <Link
//               href="/resultados"
//               className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
//                 isActive("/resultados")
//                   ? "bg-denin/10 text-denin font-medium"
//                   : "text-gray-600 hover:bg-gray-50"
//               }`}
//             >
//               <HistoryIcon size={18} />
//               <span className="text-sm font-medium">Meu Histórico</span>
//             </Link>
//             <Link
//               href="/resultados"
//               className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
//                 isActive("/resultados")
//                   ? "bg-denin/10 text-denin font-medium"
//                   : "text-gray-600 hover:bg-gray-50"
//               }`}
//             >
//               <IdCard size={18} />
//               <span className="text-sm font-medium">Dados Pessoais</span>
//             </Link>
//           </div>
//         </nav>

//         <div className="p-6 mt-auto border-t border-gray-100">
//           <div className="bg-gray-50 rounded-xl p-3">
//             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
//               Matrícula
//             </p>
//             <p className="text-xs font-medium text-gray-600">
//               {user.matricula || "N/A"}
//             </p>
//           </div>
//         </div>
//       </aside>

//       <main className="flex-grow flex flex-col">
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
//           <div className="text-sm text-gray-500 font-medium italic">
//             Olá, <span className="text-denin font-semibold">{user.nome}</span>
//           </div>

//           <div className="flex items-center gap-6">
//             <div className="flex items-center gap-3 border-l pl-6">
//               <div className="flex flex-col items-end mr-2">
//                 <span className="text-xs font-bold text-gray-800">
//                   {user.nome.split(" ")[0]}
//                 </span>
//                 <span className="text-[10px] text-gray-500 capitalize">
//                   {user.tipo}
//                 </span>
//               </div>

//               <div className="group relative">
//                 <div className="w-10 h-10 rounded-full bg-denin/10 flex items-center justify-center text-denin text-sm font-bold cursor-pointer hover:ring-2 ring-denin transition-all">
//                   {user.nome.charAt(0)}
//                 </div>
//                 <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
//                   <button
//                     onClick={() => {
//                       localStorage.clear();
//                       router.push("/login");
//                     }}
//                     className="w-full flex items-center gap-3 p-4 text-sm text-red-500 hover:bg-red-50 font-bold"
//                   >
//                     <LogOut size={16} /> Encerrar Sessão
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="p-8 grow overflow-y-auto">{children}</div>
//       </main>
//     </div>
//   );
// }
