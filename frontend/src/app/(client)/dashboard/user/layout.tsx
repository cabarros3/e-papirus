"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookMarked,
  Search,
  History,
  LogOut,
  Bell,
  UserCircle,
} from "lucide-react";

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Segue o mesmo padrão do Staff */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 font-bold text-2xl text-denin">
          e-Papirus
          <span className="block text-[10px] uppercase tracking-widest text-gray-400 font-medium">
            Portal do Leitor
          </span>
        </div>

        <nav className="flex-grow p-4 space-y-1">
          <Link
            href="/dashboard/user"
            className="flex items-center gap-3 p-3 rounded-lg bg-denin/10 text-denin font-medium"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">Início</span>
          </Link>

          <Link
            href="/resultados"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Search size={18} />
            <span className="text-sm font-medium">Pesquisar Acervo</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <BookMarked size={18} />
            <span className="text-sm font-medium">Meus Empréstimos</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <History size={18} />
            <span className="text-sm font-medium">Histórico</span>
          </Link>
        </nav>

        {/* Informações da Instituição no rodapé da Sidebar */}
        <div className="p-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
              Campus
            </p>
            <p className="text-xs font-medium text-gray-600">IFPE Igarassu</p>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex flex-col">
        {/* Header - Idêntico ao do Staff para coerência */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm text-gray-500 font-medium italic">
            Olá, <span className="text-denin">Camilla Silva</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-denin transition-colors">
              <Bell size={20} />
            </button>

            <div className="flex items-center gap-3 border-l pl-6">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-gray-800">
                  Camilla Silva
                </span>
                <span className="text-[10px] text-gray-500">Estudante</span>
              </div>

              <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-bold cursor-pointer hover:ring-2 ring-denin transition-all">
                  CS
                </div>

                {/* Menu de Sair (Coerente com Staff) */}
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                  <button className="w-full flex items-center gap-3 p-4 text-sm text-gray-700 hover:bg-gray-50">
                    <UserCircle size={16} /> Meu Perfil
                  </button>
                  <button className="w-full flex items-center gap-3 p-4 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold border-t">
                    <LogOut size={16} /> Encerrar Sessão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Área de Conteúdo da Página */}
        <div className="p-8 grow overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}

// "use client";

// import React, { useState } from "react";
// import Link from "next/link";
// import {
//   BookMarked,
//   Search,
//   History,
//   LogOut,
//   User,
//   Bell,
//   Menu,
//   X,
// } from "lucide-react";

// export default function ClientLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
//       {/* Navbar Superior Azul (Identidade e-Papirus) */}
//       <header className="h-20 bg-denin text-white px-4 md:px-12 flex items-center justify-between shadow-md sticky top-0 z-50">
//         <div className="flex items-center gap-8">
//           <Link href="/" className="text-2xl font-bold tracking-tighter">
//             e-Papirus{" "}
//             <span className="text-xs font-light opacity-60 ml-1">Portal</span>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
//             <Link
//               href="/dashboard/user"
//               className="hover:text-blue-200 transition-colors flex items-center gap-2"
//             >
//               <BookMarked size={18} /> Meus Empréstimos
//             </Link>
//             <Link
//               href="/resultados"
//               className="hover:text-blue-200 transition-colors flex items-center gap-2"
//             >
//               <Search size={18} /> Pesquisar Acervo
//             </Link>
//             <Link
//               href="#"
//               className="hover:text-blue-200 transition-colors flex items-center gap-2"
//             >
//               <History size={18} /> Histórico
//             </Link>
//           </nav>
//         </div>

//         <div className="flex items-center gap-3 md:gap-6">
//           {/* Notificações */}
//           <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors">
//             <Bell size={20} />
//             <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-denin"></span>
//           </button>

//           {/* Perfil e Logout */}
//           <div className="flex items-center gap-3 border-l border-white/20 pl-6">
//             <div className="text-right hidden sm:block">
//               <p className="text-xs font-bold leading-none">Camilla Silva</p>
//               <p className="text-[10px] opacity-70 mt-1">Matrícula: 20241012</p>
//             </div>

//             <div className="group relative">
//               <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all">
//                 <User size={20} />
//               </div>

//               {/* Dropdown Menu */}
//               <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
//                 <Link
//                   href="#"
//                   className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
//                 >
//                   <User size={16} /> Meu Perfil
//                 </Link>
//                 <hr className="my-2 border-gray-100" />
//                 <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 font-bold">
//                   <LogOut size={16} /> Sair do Portal
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <button
//             className="md:hidden"
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//           >
//             {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
//           </button>
//         </div>
//       </header>

//       {/* Mobile Navigation Drawer */}
//       {isMenuOpen && (
//         <div className="md:hidden bg-white border-b border-gray-200 animate-in slide-in-from-top duration-300">
//           <nav className="flex flex-col p-4 space-y-4 text-gray-700 font-medium">
//             <Link href="/dashboard/user" onClick={() => setIsMenuOpen(false)}>
//               Meus Empréstimos
//             </Link>
//             <Link href="/resultados" onClick={() => setIsMenuOpen(false)}>
//               Pesquisar Acervo
//             </Link>
//             <Link href="#" onClick={() => setIsMenuOpen(false)}>
//               Histórico
//             </Link>
//           </nav>
//         </div>
//       )}

//       {/* Área de Conteúdo */}
//       <main className="grow w-full max-w-7xl mx-auto p-4 md:p-10">
//         {children}
//       </main>

//       <footer className="py-8 border-t border-gray-200 bg-white">
//         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-400 text-sm">
//           <p>© 2025 e-Papirus - Sistema de Biblioteca IFPE Igarassu</p>
//           <div className="flex gap-6">
//             <Link href="/sobre" className="hover:text-denin">
//               Sobre o Projeto
//             </Link>
//             <Link href="#" className="hover:text-denin">
//               Suporte
//             </Link>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }
