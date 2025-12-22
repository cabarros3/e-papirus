"use client";

// 1. Importe o Link do Next.js aqui
import Link from "next/link";

import {
  Book,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ClipboardCheck,
  // 2. Remova o "Link" daqui para não dar conflito
  PlusCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    {
      label: "Livros no Acervo",
      value: "1.248",
      icon: Book,
      color: "bg-blue-500",
    },
    {
      label: "Empréstimos Ativos",
      value: "42",
      icon: RefreshCw,
      color: "bg-green-500",
    },
    {
      label: "Livros Atrasados",
      value: "07",
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      label: "Novos Leitores/Mês",
      value: "12",
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Visão Geral do Sistema
        </h1>
        <p className="text-gray-500">
          Monitoramento em tempo real da biblioteca.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        {/* Agora o Link vai funcionar corretamente */}
        <Link
          href="/dashboard/staff/cadastar-livro"
          className="flex items-center gap-2 px-5 py-3 bg-denin text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg shadow-denin/20"
        >
          <PlusCircle size={20} />
          <span>Cadastrar Livro</span>
        </Link>

        <button className="flex items-center gap-2 px-5 py-3 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">
          <ClipboardCheck size={20} />
          Registrar Empréstimo
        </button>
      </div>

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div className={`p-3 rounded-lg ${item.color} text-white`}>
              <item.icon size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-gray-800">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">
            Últimos Empréstimos
          </h2>
          <div className="text-center py-10 text-gray-400 italic">
            Carregando lista de atividades...
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[300px]">
          <h2 className="font-bold text-gray-800 mb-4 border-b pb-2">
            Distribuição por Assunto
          </h2>
          <div className="text-center py-10 text-gray-400 italic">
            Área reservada para gráficos de categoria.
          </div>
        </div>
      </div>
    </div>
  );
}
