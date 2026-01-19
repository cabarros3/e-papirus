"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { DashboardService, DashboardData } from "@/services/dashboard-service";
import {
  Book,
  RefreshCw,
  AlertCircle,
  Users,
  ClipboardCheck,
  PlusCircle,
  Search,
  ArrowRight,
  Loader2,
  History,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const dashboardService = useMemo(() => new DashboardService(), []);

  useEffect(() => {
    dashboardService.getStats().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [dashboardService]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-400">
        <Loader2 className="animate-spin text-denin" size={40} />
        <p className="font-bold uppercase text-xs tracking-widest">
          Sincronizando Biblioteca...
        </p>
      </div>
    );
  }

  const stats = [
    {
      label: "Obras no Acervo",
      value: data?.total_livros || 0,
      icon: Book,
      color: "bg-blue-500",
    },
    {
      label: "Empréstimos Ativos",
      value: data?.emprestimos_ativos || 0,
      icon: RefreshCw,
      color: "bg-green-500",
    },
    {
      label: "Livros Atrasados",
      value: data?.emprestimos_atrasados || 0,
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      label: "Total de Usuários",
      value: data?.total_usuarios || 0,
      icon: Users,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium italic">
            Dados reais do banco de dados e-Papirus.
          </p>
        </div>
      </header>

      {/* Atalhos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/staff/cadastrar-item"
          className="flex items-center justify-between p-5 bg-denin text-white rounded-2xl font-bold hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3">
            <PlusCircle size={24} /> <span>Novo Item</span>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/dashboard/staff/consulta-acervo"
          className="flex items-center justify-between p-5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <Search size={24} className="text-denin" />{" "}
            <span>Consultar Acervo</span>
          </div>
          <ArrowRight size={18} className="text-denin" />
        </Link>
        <Link
          href="/dashboard/staff/emprestimo"
          className="flex items-center justify-between p-5 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <ClipboardCheck size={24} className="text-green-500" />
            <span>Novo Empréstimo</span>
          </div>
        </Link>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm flex items-center gap-4"
          >
            <div
              className={`p-4 rounded-2xl ${item.color} text-white shadow-lg`}
            >
              <item.icon size={26} />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-gray-800 tracking-tighter">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Atividade Recente (Vem da API) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-6 flex items-center gap-2">
            <History size={16} className="text-denin" /> Atividade Recente
          </h2>
          <div className="space-y-4">
            {data?.atividade_recente.map((atv, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-700 uppercase">
                    {atv.leitor}
                  </span>
                  <span className="text-[10px] text-gray-400 truncate max-w-[200px]">
                    {atv.titulo}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">
                  {new Date(atv.data_emprestimo).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Livros (Bônus da sua API) */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
          <h2 className="font-bold text-gray-800 uppercase text-xs tracking-widest mb-6">
            Mais Procurados
          </h2>
          <div className="space-y-4">
            {data?.top_livros.map((livro, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold uppercase">
                  <span className="text-gray-500 truncate max-w-[250px]">
                    {livro.titulo}
                  </span>
                  <span className="text-denin">
                    {livro.total_saidas} saídas
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="bg-denin h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (livro.total_saidas /
                          (data.top_livros[0].total_saidas || 1)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
