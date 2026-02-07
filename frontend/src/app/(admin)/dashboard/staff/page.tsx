'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardService, DashboardData } from '@/services/dashboard-service';
import {
  // Book,
  // RefreshCw,
  // AlertCircle,
  // Users,
  // ClipboardCheck,
  // PlusCircle,
  Search,
  Loader2,
  History,
  // RotateCcw,
  Repeat,
  TrendingUp,
  BookPlus,
  BookUp,
  BookDown,
  BookCopy,
} from 'lucide-react';
import Image from 'next/image';

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
      <div className="h-96 flex flex-col items-center justify-center gap-2 text-gray-400">
        <Loader2 className="animate-spin text-gray-400" size={32} />
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Sincronizando Banco de Dados...
        </p>
      </div>
    );
  }

  return (
    /* AJUSTE: Removido max-w-7xl e adicionado px-8 (32px) para alinhamento */
    <div className="w-full px-8 flex flex-col gap-12 animate-in fade-in duration-500 pb-10">
      {/* HEADER */}
      <header className="flex flex-col gap-5">
        <div className="flex flex-row gap-5 content-center items-center">
          <Image
            src="/img/logo.png"
            alt="Logo e-Papirus"
            width={80}
            height={80}
          />
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Bem-vindo(a)!
          </h1>
        </div>
        <p className="text-sm text-gray-500">
          Visão geral do sistema de biblioteca e-Papirus.
        </p>
      </header>

      {/* SEÇÃO 1: CIRCULAÇÃO */}
      <section>
        <div className="flex items-center gap-3 mb-5 group">
          <div className="h-6 w-1.5 bg-[#02CBFE] rounded-full group-hover:scale-y-110 transition-transform" />
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.15em]">
            Circulação
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SimpleActionCard
            href="/dashboard/staff/emprestimo"
            label="Novo Empréstimo"
            icon={<BookUp />}
            bgColor="bg-[#E7FAFF]"
            textColor="text-[#00569C]"
          />
          <SimpleActionCard
            href="#"
            label="Renovação de Item"
            icon={<Repeat />}
            bgColor="bg-[#F7FEE7]"
            textColor="text-[#002934]"
          />
          <SimpleActionCard
            href="/dashboard/staff/devolucao"
            label="Efetuar Devolução"
            icon={<BookDown />}
            bgColor="bg-[#FFF7ED]"
            textColor="text-[#B85207]"
          />
        </div>
      </section>

      {/* SEÇÃO 2: GESTÃO DE ACERVO */}
      <section>
        <div className="flex items-center gap-3 mb-5 group">
          <div className="h-6 w-1.5 bg-[#0D4784] rounded-full group-hover:scale-y-110 transition-transform" />
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.15em]">
            Gestão de Acervo
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <AcervoLink
            href="/dashboard/staff/cadastrar-item"
            label="Novo Item"
            icon={<BookPlus size={20} />}
            bgColor="bg-[#E0EFFF]"
            textColor="text-[#004784]"
          />
          <AcervoLink
            href="/dashboard/staff/cadastrar-exemplar"
            label="Exemplares"
            icon={<BookCopy size={20} />}
            bgColor="bg-[#E6EFF7]"
            textColor="text-[#002B34]"
          />
          <AcervoLink
            href="/dashboard/staff/consulta-acervo"
            label="Consulta"
            icon={<Search size={20} />}
            bgColor="bg-[#F0F0F0]"
            textColor="text-[#666666]"
          />
        </div>
      </section>

      {/* SEÇÃO 3: ESTATÍSTICAS */}
      <section>
        <div className="flex items-center gap-3 mb-5 group">
          <div className="h-6 w-1.5 bg-[#008080] rounded-full group-hover:scale-y-110 transition-transform" />
          <h2 className="text-sm font-black text-gray-800 uppercase tracking-[0.15em]">
            Estatísticas
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CompactStat
            label="Total Usuários"
            value={data?.total_usuarios}
            color="bg-[#6CA0F1]"
          />
          <CompactStat
            label="Total do Acervo"
            value={data?.total_livros}
            color="bg-[#1579E2]"
          />
          <CompactStat
            label="Livros Emprestados"
            value={data?.emprestimos_ativos}
            color="bg-[#002B34]"
          />
          <CompactStat
            label="Livros Atrasados"
            value={data?.emprestimos_atrasados}
            color="bg-[#B22324]"
          />
        </div>
      </section>

      {/* SEÇÃO 4: TABELAS E RANKING */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade Recente */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <History size={16} className="text-[#00569C]" /> Empréstimos
              Recentes
            </h3>
            <Link
              href="/dashboard/staff/listar-emprestimos"
              className="text-[10px] font-bold text-[#00569C] hover:underline uppercase tracking-tighter"
            >
              Ver Todos
            </Link>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                <th className="px-6 py-4">Leitor</th>
                <th className="px-6 py-4">Livro</th>
                <th className="px-6 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data?.atividade_recente.map((atv, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-[#00569C]">
                      {atv.leitor}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] text-gray-500 block truncate max-w-[200px]">
                      {atv.titulo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold text-gray-400">
                      {new Date(atv.data_emprestimo).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ranking */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Ranking
              </h3>
              <h2 className="text-xl font-bold text-gray-800">
                Mais Procurados
              </h2>
            </div>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="space-y-5 mb-8 grow">
            {data?.top_livros.slice(0, 5).map((livro, i) => (
              <div
                key={i}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-20 bg-gray-200 rounded-lg overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                    <img
                      src={livro.capa || '/img/img1.jpg'}
                      alt={livro.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-2 -left-2 w-6 h-6 bg-[#00569C] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {i + 1}º
                  </span>
                </div>

                <div className="grow min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <h4 className="text-sm font-bold text-gray-800 truncate pr-2">
                      {livro.titulo}
                    </h4>
                    <span className="text-[10px] font-black text-[#00569C] whitespace-nowrap">
                      {livro.total_saidas} saídas
                    </span>
                  </div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="bg-[#00569C] h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(livro.total_saidas / (data?.top_livros[0]?.total_saidas || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-8 py-4 bg-gray-50 text-[11px] font-black text-gray-500 rounded-2xl hover:bg-[#00569C] hover:text-white uppercase tracking-widest transition-all">
            Ver Relatório Completo
          </button>
        </div>
      </section>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function SimpleActionCard({ href, label, icon, bgColor, textColor }: any) {
  return (
    <Link
      href={href}
      className={`flex flex-col justify-between min-h-[130px] p-5 rounded-2xl border border-transparent transition-all hover:shadow-md hover:-translate-y-1 group ${bgColor}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/50 shadow-sm ${textColor}`}
      >
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="flex flex-col">
        <span
          className={`text-[9px] font-black uppercase tracking-[0.15em] mb-0.5 opacity-60 ${textColor}`}
        >
          Operação
        </span>
        <span
          className={`text-lg font-black leading-tight tracking-tight ${textColor}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

function AcervoLink({ href, label, icon, bgColor, textColor }: any) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 p-4 rounded-2xl transition-all hover:shadow-md active:scale-[0.98] border border-transparent hover:border-black/5 ${bgColor}`}
    >
      <div className={`p-2.5 rounded-xl bg-white/60 shadow-sm ${textColor}`}>
        {icon}
      </div>
      <span
        className={`text-base font-black uppercase tracking-tight ${textColor}`}
      >
        {label}
      </span>
    </Link>
  );
}

function CompactStat({ label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center min-h-[120px] transition-all hover:shadow-md group relative overflow-hidden">
      <p className="text-4xl font-black text-gray-900 tracking-tighter mb-2 leading-none">
        {value || 0}
      </p>
      <p className="text-xs font-bold text-[#666666] leading-tight group-hover:text-gray-900 transition-colors">
        {label}
      </p>
      <div
        className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full ${color} opacity-0 group-hover:opacity-100 transition-opacity`}
      />
    </div>
  );
}
