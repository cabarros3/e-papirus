"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Fixa na esquerda */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 font-bold text-2xl text-denin">
          e-Papirus
        </div>

        <nav className="flex-grow p-4 space-y-2">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 p-3 rounded-lg bg-denin/10 text-denin font-medium"
          >
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link
            href="/resultados"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <BookOpen size={20} /> Gerenciar Acervo
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Users size={20} /> Usuários
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Settings size={20} /> Configurações
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
            <LogOut size={20} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-grow flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="text-sm text-gray-500 font-medium italic">
            Bem-vindo, Bibliotecário(a)
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-denin flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
