"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
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
} from "lucide-react";
import { Toaster } from "sonner";
import { Pessoa } from "@/types/pessoas";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<Pessoa | null>(null);

  const [openAcervo, setOpenAcervo] = useState(true);
  const [openItens, setOpenItens] = useState(true);
  const [openCirculacao, setOpenCirculacao] = useState(false);
  const [openReservaMenu, setOpenReservaMenu] = useState(false);

  useEffect(() => {
    const identifier = window.requestAnimationFrame(() => {
      const saved = localStorage.getItem("bib_user");
      const token = localStorage.getItem("bib_token");

      if (!saved || !token) {
        router.push("/login");
        return;
      }

      try {
        setUser(JSON.parse(saved));
        setIsReady(true);
      } catch (error) {
        router.push("/login");
      }
    });
    return () => window.cancelAnimationFrame(identifier);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("bib_token");
    localStorage.removeItem("bib_user");
    router.push("/login");
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
          isCollapsed ? "w-24" : "w-72"
        } bg-white border-r border-gray-200 hidden md:flex flex-col transition-all duration-300 ease-in-out relative flex-shrink-0`}
      >
        <div
          className={`h-20 border-b border-gray-100 flex items-center px-6 ${isCollapsed ? "justify-center" : "justify-between"}`}
        >
          <div
            className={`overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"}`}
          >
            <div className="text-2xl font-bold text-black whitespace-nowrap">
              <span className="text-denin">e</span>-Papirus
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
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
            label="Dashboard"
            active={isActive("/dashboard/staff")}
            collapsed={isCollapsed}
          />

          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenAcervo(!openAcervo);
              }}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
                >
                  Gerenciar Acervo
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openAcervo ? "rotate-180" : ""}`}
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
                    className={`transition-transform ${openItens ? "rotate-180" : ""}`}
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
                      icon={<BookPlus size={16} />}
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

          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) setIsCollapsed(false);
                setOpenCirculacao(!openCirculacao);
              }}
              className={`w-full flex items-center p-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all ${isCollapsed ? "justify-center" : "justify-between"}`}
            >
              <div className="flex items-center gap-3">
                <HandHelping size={20} className="shrink-0" />
                <span
                  className={`text-base font-semibold whitespace-nowrap transition-opacity duration-200 ${isCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
                >
                  Circulação
                </span>
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={18}
                  className={`transition-transform ${openCirculacao ? "rotate-180" : ""}`}
                />
              )}
            </button>

            {openCirculacao && !isCollapsed && (
              <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-1 mt-1 font-medium">
                <SubNavItem
                  href="/dashboard/staff/emprestimo"
                  icon={<HandHelping size={18} />}
                  label="Empréstimo"
                />
                <SubNavItem
                  href="/dashboard/staff/devolucao"
                  icon={<RotateCcw size={18} />}
                  label="Devolução"
                />
                <SubNavItem
                  href="#"
                  icon={<Repeat size={18} />}
                  label="Renovação"
                />

                <button
                  onClick={() => setOpenReservaMenu(!openReservaMenu)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg text-gray-600 hover:text-denin transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CalendarDays size={18} />
                    <span className="text-sm font-bold uppercase tracking-wide">
                      Reservas
                    </span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${openReservaMenu ? "rotate-180" : ""}`}
                  />
                </button>
                {openReservaMenu && (
                  <div className="ml-4 border-l-2 border-gray-100 space-y-1">
                    <SubNavItem
                      href="/dashboard/staff/listar-reservas"
                      icon={<Search size={16} />}
                      label="Listar Reservas"
                    />
                    <SubNavItem
                      href="/dashboard/staff/cadastrar-reservas"
                      icon={<BookPlus size={16} />}
                      label="Nova Reserva"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <NavItem
            href="#"
            icon={<Users size={20} />}
            label="Usuários"
            collapsed={isCollapsed}
          />
          <NavItem
            href="#"
            icon={<Settings size={20} />}
            label="Configurações"
            collapsed={isCollapsed}
          />
        </nav>

        <div className="p-6 border-t border-gray-100">
          {isCollapsed ? (
            <div className="w-12 h-12 rounded-full bg-denin/10 text-denin flex items-center justify-center mx-auto text-xs font-black">
              ADM
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-4 text-center overflow-hidden border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
                Acesso
              </p>
              <p className="text-sm font-extrabold text-gray-700 truncate">
                {user.cargo || "Bibliotecário(a)"}
              </p>
            </div>
          )}
        </div>
      </aside>

      <main className="grow flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-10 shadow-sm">
          <div className="text-base text-gray-500 font-semibold truncate mr-4">
            Painel Administrativo <span className="mx-3 text-gray-300">|</span>
            <span className="text-black">
              <span className="text-denin">e</span>-Papirus
            </span>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-bold text-gray-900 uppercase leading-none mb-1">
                {user.nome}
              </span>
              <span className="text-xs text-denin font-bold uppercase tracking-widest">
                {user.tipo || "STAFF"}
              </span>
            </div>

            <div className="group relative">
              <div className="w-12 h-12 rounded-full bg-denin flex items-center justify-center text-white text-base font-black cursor-pointer shadow-md hover:scale-105 transition-transform">
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

function NavItem({ href, icon, label, active, collapsed }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
        active
          ? "bg-denin/10 text-denin font-bold shadow-sm"
          : "text-gray-700 hover:bg-gray-50 hover:text-denin"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : ""}
    >
      <div className="shrink-0">{icon}</div>
      <span
        className={`text-base font-semibold whitespace-nowrap transition-all duration-200 ${collapsed ? "opacity-0 w-0 invisible" : "opacity-100 w-auto visible"}`}
      >
        {label}
      </span>
    </Link>
  );
}

function SubNavItem({ href, icon, label }: any) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 text-sm text-gray-600 font-bold hover:text-denin hover:bg-denin/5 rounded-lg transition-all whitespace-nowrap"
    >
      <div className="shrink-0">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   LayoutDashboard,
//   BookOpen,
//   Users,
//   Settings,
//   LogOut,
//   ChevronDown,
//   BookPlus,
//   Repeat,
//   RotateCcw,
//   CalendarDays,
//   HandHelping,
//   Users2,
//   Tags,
//   Search,
//   BookMarked,
// } from "lucide-react";
// import { Toaster } from "sonner";
// import { Pessoa } from "@/types/pessoas";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const router = useRouter();

//   // Estados de controle do menu
//   const [openAcervo, setOpenAcervo] = useState(true);
//   const [openItens, setOpenItens] = useState(true);
//   const [openCirculacao, setOpenCirculacao] = useState(false);
//   const [openReservaMenu, setOpenReservaMenu] = useState(false);

//   // Estado unificado para controle de montagem e usuário
//   const [status, setStatus] = useState<{
//     isMounted: boolean;
//     user: Pessoa | null;
//   }>({
//     isMounted: false,
//     user: null,
//   });

//   useEffect(() => {
//     const checkAuth = () => {
//       const saved = localStorage.getItem("bib_user");

//       if (!saved) {
//         router.push("/login");
//         return;
//       }

//       // setTimeout evita o erro de cascading renders ao tirar a atualização do fluxo síncrono
//       setTimeout(() => {
//         setStatus({
//           isMounted: true,
//           user: JSON.parse(saved),
//         });
//       }, 0);
//     };

//     checkAuth();
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem("bib_token");
//     localStorage.removeItem("bib_user");
//     router.push("/login");
//   };

//   // Prevenção de erro de Hidratação e Cascade
//   if (!status.isMounted || !status.user) {
//     return null;
//   }

//   const { user } = status;

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
//         <div className="p-6 border-b border-gray-100 font-bold text-2xl text-denin">
//           e-Papirus
//         </div>

//         <nav className="grow p-4 space-y-1 overflow-y-auto">
//           <Link
//             href="/dashboard/staff"
//             className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//           >
//             <LayoutDashboard size={18} />
//             <span className="text-sm font-medium">Dashboard</span>
//           </Link>

//           {/* Menu Gerenciar Acervo */}
//           <div>
//             <button
//               onClick={() => setOpenAcervo(!openAcervo)}
//               className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <BookOpen size={18} />
//                 <span className="text-sm font-medium">Gerenciar Acervo</span>
//               </div>
//               <ChevronDown
//                 size={14}
//                 className={`transition-transform ${openAcervo ? "rotate-180" : ""}`}
//               />
//             </button>

//             {openAcervo && (
//               <div className="ml-6 mt-1 space-y-1 border-l border-gray-100">
//                 <div className="ml-3">
//                   <button
//                     onClick={() => setOpenItens(!openItens)}
//                     className="w-full flex items-center justify-between p-2 rounded-lg text-gray-500 hover:text-denin transition-colors"
//                   >
//                     <div className="flex items-center gap-2">
//                       <BookMarked size={15} />
//                       <span className="text-xs font-semibold">Itens</span>
//                     </div>
//                     <ChevronDown
//                       size={12}
//                       className={`transition-transform ${openItens ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {openItens && (
//                     <div className="ml-6 mt-1 space-y-1">
//                       <Link
//                         href="/dashboard/staff/consulta-acervo"
//                         className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
//                       >
//                         <Search size={13} /> Consulta ao Acervo
//                       </Link>
//                       <Link
//                         href="/dashboard/staff/cadastrar-item"
//                         className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
//                       >
//                         <BookPlus size={13} /> Cadastrar Novo Item
//                       </Link>
//                       <Link
//                         href="/dashboard/staff/cadastrar-exemplar"
//                         className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
//                       >
//                         <BookPlus size={13} /> Gerenciar Exemplares
//                       </Link>
//                     </div>
//                   )}
//                 </div>

//                 <Link
//                   href="/dashboard/staff/autores"
//                   className="ml-3 flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
//                 >
//                   <Users2 size={15} /> Autores
//                 </Link>
//                 <Link
//                   href="/dashboard/staff/assuntos"
//                   className="ml-3 flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
//                 >
//                   <Tags size={15} /> Assuntos
//                 </Link>
//               </div>
//             )}
//           </div>

//           {/* Menu Circulação */}
//           <div>
//             <button
//               onClick={() => setOpenCirculacao(!openCirculacao)}
//               className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//             >
//               <div className="flex items-center gap-3">
//                 <HandHelping size={18} />
//                 <span className="text-sm font-medium">Circulação</span>
//               </div>
//               <ChevronDown
//                 size={14}
//                 className={`transition-transform ${openCirculacao ? "rotate-180" : ""}`}
//               />
//             </button>

//             {openCirculacao && (
//               <div className="ml-9 mt-1 space-y-1">
//                 <Link
//                   href="/dashboard/staff/emprestimo"
//                   className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
//                 >
//                   <HandHelping size={14} /> Novo Empréstimo
//                 </Link>
//                 <Link
//                   href="/dashboard/staff/devolucao"
//                   className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
//                 >
//                   <RotateCcw size={14} /> Devolução
//                 </Link>
//                 <Link
//                   href="#"
//                   className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
//                 >
//                   <Repeat size={14} /> Renovação
//                 </Link>

//                 {/* Submenu de Reservas */}
//                 <div>
//                   <button
//                     onClick={() => setOpenReservaMenu(!openReservaMenu)}
//                     className="w-full flex items-center justify-between p-2 rounded-lg text-gray-500 hover:text-denin transition-colors"
//                   >
//                     <div className="flex items-center gap-2">
//                       <CalendarDays size={14} />
//                       <span className="text-xs font-semibold">Reservas</span>
//                     </div>
//                     <ChevronDown
//                       size={12}
//                       className={`transition-transform ${openReservaMenu ? "rotate-180" : ""}`}
//                     />
//                   </button>

//                   {openReservaMenu && (
//                     <div className="ml-4 mt-1 space-y-1 border-l border-gray-100">
//                       <Link
//                         href="/dashboard/staff/listar-reservas"
//                         className="flex items-center gap-2 p-2 ml-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
//                       >
//                         <Search size={13} /> Listar Reservas
//                       </Link>
//                       <Link
//                         href="/dashboard/staff/cadastrar-reservas"
//                         className="flex items-center gap-2 p-2 ml-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
//                       >
//                         <BookPlus size={13} /> Nova Reserva
//                       </Link>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           <Link
//             href="#"
//             className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//           >
//             <Users size={18} />
//             <span className="text-sm font-medium">Usuários</span>
//           </Link>

//           <Link
//             href="#"
//             className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
//           >
//             <Settings size={18} />
//             <span className="text-sm font-medium">Configurações</span>
//           </Link>
//         </nav>
//       </aside>

//       <main className="grow flex flex-col">
//         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
//           <div className="text-sm text-gray-500 font-medium">
//             Painel Administrativo <span className="mx-2 text-gray-300">|</span>
//             <span className="text-denin">e-Papirus</span>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="flex flex-col items-end mr-2">
//               <span className="text-xs font-bold text-gray-800 uppercase">
//                 {user.nome}
//               </span>
//               <span className="text-[10px] text-gray-500 capitalize">
//                 {user.cargo || "Bibliotecário(a)"}
//               </span>
//             </div>

//             <div className="group relative">
//               <div className="w-10 h-10 rounded-full bg-denin flex items-center justify-center text-white text-sm font-bold cursor-pointer ring-2 ring-transparent group-hover:ring-denin/20 transition-all">
//                 {user.nome.substring(0, 2).toUpperCase()}
//               </div>
//               <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
//                 <button
//                   onClick={handleLogout}
//                   className="w-full flex items-center gap-3 p-4 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
//                 >
//                   <LogOut size={16} /> Encerrar Sessão
//                 </button>
//               </div>
//             </div>
//           </div>
//         </header>

//         <div className="p-8 overflow-y-auto">{children}</div>
//       </main>

//       <Toaster position="top-right" richColors closeButton />
//     </div>
//   );
// }
