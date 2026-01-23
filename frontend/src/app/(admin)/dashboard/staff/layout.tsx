"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Search, // Ícone para consulta
  BookMarked, // Ícone para o submenu de itens
} from "lucide-react";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [openAcervo, setOpenAcervo] = useState(true);
  const [openItens, setOpenItens] = useState(true); // Estado para o novo submenu
  const [openCirculacao, setOpenCirculacao] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 font-bold text-2xl text-denin">
          e-Papirus
        </div>

        <nav className="grow p-4 space-y-1 overflow-y-auto">
          {/* Dashboard */}
          <Link
            href="/dashboard/staff"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          {/* Gerenciar Acervo com Submenu */}
          <div>
            <button
              onClick={() => setOpenAcervo(!openAcervo)}
              className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen size={18} />
                <span className="text-sm font-medium">Gerenciar Acervo</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  openAcervo ? "rotate-180" : ""
                }`}
              />
            </button>

            {openAcervo && (
              <div className="ml-6 mt-1 space-y-1 border-l border-gray-100">
                {/* SUBMENU: Gerenciar Itens (Aninhado) */}
                <div className="ml-3">
                  <button
                    onClick={() => setOpenItens(!openItens)}
                    className="w-full flex items-center justify-between p-2 rounded-lg text-gray-500 hover:text-denin transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookMarked size={15} />
                      <span className="text-xs font-semibold">Itens</span>
                    </div>
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${
                        openItens ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {openItens && (
                    <div className="ml-6 mt-1 space-y-1">
                      <Link
                        href="/dashboard/staff/consulta-acervo"
                        className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
                      >
                        <Search size={13} /> Consulta ao Acervo
                      </Link>
                      <Link
                        href="/dashboard/staff/cadastrar-item"
                        className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
                      >
                        <BookPlus size={13} /> Cadastrar Novo Item
                      </Link>


                      <Link
                        href="/dashboard/staff/cadastrar-exemplar"
                        className="flex items-center gap-2 p-2 text-[11px] text-gray-400 hover:text-denin transition-colors"
                      >
                        <BookPlus size={13} /> Gerenciar Exemplares
                      </Link>


                    </div>
                  )}
                </div>

                {/* Autores e Assuntos (Nível 2 do Acervo) */}
                <Link
                  href="/dashboard/staff/autores"
                  className="ml-3 flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <Users2 size={15} /> Autores
                </Link>
                <Link
                  href="/dashboard/staff/assuntos"
                  className="ml-3 flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <Tags size={15} /> Assuntos
                </Link>
              </div>
            )}
          </div>

          {/* Circulação (Empréstimos) com Submenu */}
          <div>
            <button
              onClick={() => setOpenCirculacao(!openCirculacao)}
              className="w-full flex items-center justify-between p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <HandHelping size={18} />
                <span className="text-sm font-medium">Circulação</span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  openCirculacao ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCirculacao && (
              <div className="ml-9 mt-1 space-y-1">
                <Link
                  href="/dashboard/staff/emprestimo"
                  className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <HandHelping size={14} /> Novo Empréstimo
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <RotateCcw size={14} /> Devolução
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <Repeat size={14} /> Renovação
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-2 p-2 text-xs text-gray-500 hover:text-denin transition-colors"
                >
                  <CalendarDays size={14} /> Reservas
                </Link>
              </div>
            )}
          </div>

          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Users size={18} />{" "}
            <span className="text-sm font-medium">Usuários</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings size={18} />{" "}
            <span className="text-sm font-medium">Configurações</span>
          </Link>
        </nav>
      </aside>

      <main className="grow flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="text-sm text-gray-500 font-medium">
            Painel Administrativo <span className="mx-2 text-gray-300">|</span>
            <span className="text-denin">e-Papirus</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-bold text-gray-800">
                Admin Staff
              </span>
              <span className="text-[10px] text-gray-500">
                Bibliotecário(a)
              </span>
            </div>

            <div className="group relative">
              <div className="w-10 h-10 rounded-full bg-denin flex items-center justify-center text-white text-sm font-bold cursor-pointer ring-2 ring-transparent group-hover:ring-denin/20 transition-all">
                AD
              </div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button
                  onClick={() => alert("Saindo...")}
                  className="w-full flex items-center gap-3 p-4 text-sm text-red-500 hover:bg-red-50 transition-colors font-bold"
                >
                  <LogOut size={16} /> Encerrar Sessão
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">{children}</div>
      </main>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
