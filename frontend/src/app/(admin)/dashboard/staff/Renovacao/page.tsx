'use client';

import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  User,
  BookOpen,
  AlertCircle,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Serviços e Tipos
import emprestimoService from '@/services/emprestimo-service';
import { pessoaService } from '@/services/pessoa-service';
import { Pessoa } from '@/types/pessoas';

// Componentes Reutilizados
import { UserSearchInput } from '@/components/inputs/UserSearchInput';

export default function RenovacaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingLivros, setLoadingLivros] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Dados
  const [estudantes, setEstudantes] = useState<Pessoa[]>([]);
  const [usuario, setUsuario] = useState({ id: '', nome: '' });
  const [emprestimosAtivos, setEmprestimosAtivos] = useState<any[]>([]);

  // Estados de Seleção
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [novaData, setNovaData] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const lista = await pessoaService.listar();
        setEstudantes(lista || []);
      } catch (e) {
        console.error('Erro ao carregar lista de usuários');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!usuario.id) {
      setEmprestimosAtivos([]);
      setSelecionado(null);
      return;
    }

    const buscarLivros = async () => {
      setLoadingLivros(true);
      try {
        const dados = await emprestimoService.getFiltrado(
          Number(usuario.id),
          'pendente'
        );
        setEmprestimosAtivos(dados);
      } catch (e) {
        console.error('Erro ao buscar livros do usuário');
      } finally {
        setLoadingLivros(false);
      }
    };
    buscarLivros();
  }, [usuario.id]);

  // Calcula data mínima (amanhã) e data máxima (30 dias a partir de hoje)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  const handleRenovar = async () => {
    if (!selecionado || !novaData) {
      toast.error('Selecione um livro e a nova data de devolução');
      return;
    }

    setIsSubmitting(true);
    try {
      await emprestimoService.renovar(selecionado, novaData);
      toast.success('Renovação realizada com sucesso!');

      // Redireciona para o dashboard após 1 segundo
      setTimeout(() => {
        router.push('/dashboard/staff/');
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao renovar empréstimo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  return (
    <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* CABEÇALHO PADRONIZADO */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/staff/"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-poppins font-bold text-gray-900 uppercase tracking-tight">
            Renovação de Empréstimos
          </h1>
          <p className="text-sm text-gray-500 font-medium font-sans">
            Selecione o leitor e o exemplar para renovar.
          </p>
        </div>
      </div>

      {/* CARD PRINCIPAL EM GRID */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
        {/* COLUNA ESQUERDA: BUSCA */}
        <div className="flex flex-col justify-center space-y-8 border-b md:border-b-0 md:border-r border-gray-100 md:pr-8">
          <div className="space-y-6">
            <h2 className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Identificação do Leitor
            </h2>

            <UserSearchInput
              usuarios={estudantes}
              selecionadoId={usuario.id}
              selecionadoNome={usuario.nome}
              onSelect={(u) =>
                setUsuario({ id: String(u.id_pessoa), nome: u.nome })
              }
            />

            {usuario.id && (
              <div className="p-6 bg-green-50/50 rounded-[2rem] border border-green-100 animate-in zoom-in-95">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                  Leitor ativo
                </p>
                <p className="text-xl font-poppins font-bold text-gray-800">
                  {usuario.nome}
                </p>
              </div>
            )}

            {selecionado && (
              <div className="space-y-3">
                <label className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={14} /> Nova Data de Devolução
                </label>
                <input
                  type="date"
                  value={novaData}
                  onChange={(e) => setNovaData(e.target.value)}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-[10px] text-gray-400 font-medium">
                  Período: Mínimo 1 dia, máximo 30 dias
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleRenovar}
            disabled={isSubmitting || !selecionado || !novaData || !usuario.id}
            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-green-100 disabled:opacity-40 transition-all active:scale-[0.98] hover:bg-blue-700 flex items-center justify-center gap-3 mt-auto"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <RefreshCw size={20} />
                Confirmar Renovação
              </>
            )}
          </button>
        </div>

        {/* COLUNA DIREITA: SELEÇÃO */}
        <div className="space-y-6 md:pl-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Livros Emprestados
            </h2>
          </div>

          <div className="flex-1 flex flex-col space-y-3">
            {loadingLivros ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-gray-400 font-medium">
                  Buscando empréstimos...
                </p>
              </div>
            ) : emprestimosAtivos.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {emprestimosAtivos.map((emp) => (
                  <div
                    key={emp.id_emprestimo}
                    onClick={() => setSelecionado(emp.id_emprestimo)}
                    className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer border transition-all ${selecionado === emp.id_emprestimo
                        ? 'border-blue-600 bg-green-50 ring-1 ring-blue-600'
                        : 'border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white'
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selecionado === emp.id_emprestimo
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-200'
                        }`}
                    >
                      {selecionado === emp.id_emprestimo && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-poppins font-bold text-[13px] text-gray-800 leading-tight">
                        {emp.titulo}
                      </p>
                      <p
                        className={`text-[10px] font-bold mt-1 uppercase ${emp.cor === 'red' ? 'text-red-500' : 'text-blue-600'}`}
                      >
                        Vencimento: {emp.data_prevista
                          ? emp.data_prevista.split('-').reverse().join('/')
                          : ''
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-gray-50/20">
                <AlertCircle size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-400 text-sm font-poppins font-semibold">
                  {usuario.id
                    ? 'Nenhum livro emprestado!'
                    : 'Aguardando seleção do leitor'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*'use client';

import { useState } from 'react';

export default function RenovacaoPage() {
  const [novaData, setNovaData] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleRenovar() {
    if (!novaData) {
      setMensagem('Selecione uma nova data de devolução');
      return;
    }

    try {
      setLoading(true);
      setMensagem(null);

      const response = await fetch(
        'http://localhost/e-papirus/backend-php/api/renovacoes/renovar.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emprestimo_id: 1,   // depois pode vir da URL
            nova_data_devolucao: novaData,
            staff_id: 1         // depois pode vir da sessão/login
          })
        }
      );

      const data = await response.json();

      if (data.sucesso) {
        setMensagem('Livro renovado com sucesso');
      } else {
        setMensagem(data.mensagem || 'Erro ao renovar');
      }
    } catch (error) {
      setMensagem('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-semibold mb-4">
        Renovação de Livro
      </h1>

      <div className="bg-white shadow rounded p-4 mb-4">
        <p><strong>Livro:</strong> ---</p>
        <p><strong>Usuário:</strong> ---</p>
        <p><strong>Data de devolução:</strong> ---</p>
        <p><strong>Renovações:</strong> ---</p>
      </div>

      <label className="block text-sm font-medium mb-2">
        Nova data de devolução
      </label>

      <input
        type="date"
        className="border rounded px-3 py-2 w-full mb-4"
        value={novaData}
        onChange={(e) => setNovaData(e.target.value)}
      />

      <button
        onClick={handleRenovar}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Renovando...' : 'Renovar livro'}
      </button>

      {mensagem && (
        <p className="mt-4 text-sm">
          {mensagem}
        </p>
      )}
    </div>
  );
}*/
