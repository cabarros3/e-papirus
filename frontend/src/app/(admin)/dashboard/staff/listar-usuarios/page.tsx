'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { pessoaService } from '@/services/pessoa-service';
import { Pessoa } from '@/types/pessoas';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  // UserEdit,
  // Trash2,
  Mail,
  IdCard,
  Loader2,
  Filter,
  ArrowLeft,
  // User,
  UserPen,
} from 'lucide-react';
import Link from 'next/link';
import { ModalEditarUsuario } from '@/components/modals/edit-user-modal';

export default function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  // Estado para o Modal
  const [usuarioParaEditar, setUsuarioParaEditar] = useState<Pessoa | null>(
    null
  );

  const carregarUsuarios = async () => {
    setLoading(true);
    try {
      const dados = await pessoaService.listar();
      setUsuarios(dados);
    } catch (error) {
      toast.error('Erro ao carregar a lista de usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // const handleExcluir = async (id: number, nome: string) => {
  //   if (!confirm(`Tem certeza que deseja excluir o usuário ${nome}?`)) return;

  //   try {
  //     await pessoaService.deletar(id);
  //     toast.success("Usuário removido com sucesso!");
  //     setUsuarios(usuarios.filter((u) => u.id_pessoa !== id));
  //   } catch (error: any) {
  //     toast.error(error.message || "Erro ao excluir usuário.");
  //   }
  // };

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchesBusca =
        u.nome.toLowerCase().includes(busca.toLowerCase()) ||
        u.matricula.includes(busca) ||
        u.cpf.includes(busca);

      const matchesTipo = filtroTipo === 'todos' || u.tipo === filtroTipo;

      return matchesBusca && matchesTipo;
    });
  }, [usuarios, busca, filtroTipo]);

  return (
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER INTEGRADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/staff"
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold uppercase text-gray-900 tracking-tight leading-none">
              Gerenciar Usuários
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Visualize, edite e gerencie as pessoas cadastradas no sistema.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/staff/cadastrar-usuario"
          className="flex items-center gap-2 bg-[#0056b3] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#004494] transition-all shadow-lg shadow-blue-200/50 whitespace-nowrap min-h-[60px]"
        >
          <Plus size={20} strokeWidth={3} />
          <span className="text-sm">Novo Usuário</span>
        </Link>
      </div>

      {/* FILTROS E BUSCA EM UMA LINHA */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 relative group font-medium w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-denin transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por nome, CPF ou matrícula..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-denin/5 focus:border-denin transition-all text-gray-600"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="relative min-w-[220px] w-full md:w-auto">
          <Filter
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            className="w-full pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-2xl outline-none shadow-sm focus:ring-4 focus:ring-denin/5 font-bold text-sm text-gray-600 appearance-none cursor-pointer"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            <option value="aluno">Alunos</option>
            <option value="professor">Professores</option>
            <option value="funcionario">Funcionários</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-denin" size={40} />
            <p className="text-gray-500 font-medium italic">
              Sincronizando usuários...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Usuário
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Documentação
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Tipo / Perfil
                  </th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Contato
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((u) => (
                    <tr
                      key={u.id_pessoa}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-denin/10 text-denin flex items-center justify-center font-black text-sm border border-blue-50">
                            {u.nome.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">
                              {u.nome}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold italic">
                              ID: #{u.id_pessoa}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-semibold">
                            <IdCard size={14} className="text-gray-300" />
                            <span>{u.matricula}</span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                            CPF: {u.cpf}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${getBadgeColor(u.tipo)}`}
                          >
                            {u.tipo}
                          </span>
                          {u.cargo && (
                            <p className="text-[9px] text-gray-400 mt-1 font-bold uppercase">
                              {u.cargo}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Mail size={14} className="text-gray-300" />
                            {u.email}
                          </div>
                          {u.telefone && (
                            <p className="text-xs text-gray-400 italic">
                              {u.telefone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => setUsuarioParaEditar(u)}
                            className="p-2.5 text-denin hover:bg-denin/10 rounded-xl transition-all"
                            title="Editar Usuário"
                          >
                            <UserPen size={20} />
                          </button>
                          {/* <button
                            onClick={() => handleExcluir(u.id_pessoa, u.nome)}
                            className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Excluir Usuário"
                          >
                            <Trash2 size={20} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-20 text-center text-gray-500 font-medium"
                    >
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Renderização Condicional do Modal */}
      {usuarioParaEditar && (
        <ModalEditarUsuario
          usuario={usuarioParaEditar}
          onClose={() => setUsuarioParaEditar(null)}
          onSuccess={carregarUsuarios}
        />
      )}
    </div>
  );
}

function getBadgeColor(tipo: string) {
  switch (tipo) {
    case 'aluno':
      return 'bg-blue-50 text-blue-500 border border-blue-100';
    case 'professor':
      return 'bg-purple-50 text-purple-500 border border-purple-100';
    case 'funcionario':
      return 'bg-orange-50 text-orange-600 border border-orange-100';
    default:
      return 'bg-gray-50 text-gray-500';
  }
}
