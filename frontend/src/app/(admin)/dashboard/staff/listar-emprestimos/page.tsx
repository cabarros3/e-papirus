"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  User,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import emprestimoService from "@/services/emprestimo-service";
import { Emprestimo } from "@/types/emprestimos";

export default function ListaEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [busca, setBusca] = useState("");

  const carregarDados = async () => {
    setLoading(true);
    try {
      const dados = await emprestimoService.getFiltrado(
        undefined,
        filtroStatus,
      );
      setEmprestimos(dados || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setEmprestimos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroStatus]);

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "--/--/----";
    try {
      const data = new Date(dataStr + "T00:00:00");
      return data.toLocaleDateString("pt-BR");
    } catch {
      return dataStr;
    }
  };

  const emprestimosFiltrados = emprestimos.filter(
    (emp) =>
      emp.nome_pessoa?.toLowerCase().includes(busca.toLowerCase()) ||
      emp.titulo?.toLowerCase().includes(busca.toLowerCase()),
  );

  const getStatusIcon = (situacao: string) => {
    switch (situacao) {
      case "Finalizado":
        return <CheckCircle size={14} className="text-green-500" />;
      case "Atrasado":
        return <AlertTriangle size={14} className="text-red-500" />;
      default:
        return <Clock size={14} className="text-blue-500" />;
    }
  };

  return (
    /* AJUSTE: Aplicado w-full px-8 para 32px de respiro lateral */
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/staff"
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestão de Empréstimos
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Histórico e monitoramento de circulação.
            </p>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-[2rem] border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex bg-gray-100 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {["todos", "em_dia", "devolvido", "atrasado"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  filtroStatus === status
                    ? "bg-white text-denin shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {status.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Buscar por leitor ou livro..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none text-sm"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-denin" size={40} />
            <p className="text-gray-400 font-medium">Carregando registros...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Leitor
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Livro / Exemplar
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Datas
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {emprestimosFiltrados.length > 0 ? (
                  emprestimosFiltrados.map((emp) => (
                    <tr
                      key={emp.id_emprestimo}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-50 p-2 rounded-xl text-denin">
                            <User size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {emp.nome_pessoa || "Sem nome"}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              {emp.email_pessoa}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-orange-50 p-2 rounded-xl text-orange-600">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">
                              {emp.titulo}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              ID Exemplar: #{emp.id_exemplar}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar size={12} />
                            <span>
                              Emp: {formatarData(emp.data_emprestimo)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-800">
                            <Clock size={12} />
                            <span>Prev: {formatarData(emp.data_prevista)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${emp.cor === "green" ? "bg-green-100 text-green-700" : ""}
                            ${emp.cor === "red" ? "bg-red-100 text-red-700" : ""}
                            ${emp.cor === "blue" ? "bg-blue-100 text-blue-700" : ""}
                          `}
                        >
                          {getStatusIcon(emp.situacao)}
                          {emp.situacao}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-20 text-center text-gray-400"
                    >
                      Nenhum empréstimo encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
