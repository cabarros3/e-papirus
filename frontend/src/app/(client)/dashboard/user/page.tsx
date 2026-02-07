'use client';
import React, { useEffect, useState } from 'react';
import {
  AlunoDashboardService,
  AlunoDashboardData,
} from '../../../../services/aluno-dashboard-service';
import { Book, Clock, History, AlertCircle, Loader2 } from 'lucide-react';

export default function AlunoDashboard() {
  const [dados, setDados] = useState<AlunoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErro(null);

        // 1. Busca no sessionStorage com a chave correta bib_user
        const userString = sessionStorage.getItem("bib_user");

        if (!userString) {
          setErro('Sessão não encontrada. Por favor, faça login.');
          return;
        }

        // 2. Tenta fazer o parse e extrair o id_pessoa
        const user = JSON.parse(userString);
        const idPessoa = user?.id_pessoa;

        if (!idPessoa) {
          setErro('ID do usuário não identificado.');
          return;
        }

        // 3. Chamada ao service
        const service = new AlunoDashboardService();
        const data = await service.getStats(idPessoa);

        if (data) {
          setDados(data);
        } else {
          setErro('Não foi possível carregar os dados do servidor.');
        }
      } catch (e) {
        console.error('Erro no Dashboard:', e);
        setErro('Ocorreu um erro ao processar sua solicitação.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // --- RENDERIZAÇÃO DE ESTADOS DE CARGA E ERRO ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Carregando seus dados...</p>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-800">
            Ops! Algo deu errado
          </h2>
          <p className="text-red-600 mb-6">{erro || 'Erro desconhecido'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DO DASHBOARD ---

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Meu Painel de Leitor
        </h1>
        <p className="text-gray-500 mt-1">Bem-vindo(a) de volta!</p>
      </header>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          icon={<Book size={24} />}
          label="Livros com Você"
          value={dados.ativos}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <MetricCard
          icon={<AlertCircle size={24} />}
          label="Em Atraso"
          value={dados.atrasados}
          color="text-red-600"
          bgColor="bg-red-50"
        />
        <MetricCard
          icon={<History size={24} />}
          label="Total Lido"
          value={dados.historico_lidos}
          color="text-green-600"
          bgColor="bg-green-50"
        />
      </div>

      {/* Lista de Livros Atuais */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            Meus Empréstimos Atuais
          </h2>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {dados.meus_livros.length} livro(s)
          </span>
        </div>

        {dados.meus_livros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dados.meus_livros.map((livro) => (
              <div
                key={livro.id_emprestimo}
                className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-28 bg-gray-50 flex-shrink-0 border-r border-gray-50">
                  {livro.capa ? (
                    <img
                      src={livro.capa}
                      alt={livro.titulo}
                      className="w-full h-full object-cover shadow-inner"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Book size={32} />
                    </div>
                  )}
                </div>

                <div className="p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="font-bold text-gray-900 leading-snug mb-1">
                      {livro.titulo}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 gap-1">
                      <Clock size={12} />
                      <span>
                        Entrega:{' '}
                        {new Date(livro.data_prevista).toLocaleDateString(
                          'pt-BR'
                        )}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`mt-3 text-xs font-extrabold px-3 py-1.5 rounded-full w-fit uppercase tracking-wider
                    ${
                      livro.cor === 'red'
                        ? 'bg-red-100 text-red-600'
                        : livro.cor === 'orange'
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {livro.status_texto}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
              <Book size={28} />
            </div>
            <p className="text-gray-500 font-medium">
              Você não possui empréstimos ativos no momento.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Componente de Card Reutilizável
function MetricCard({ icon, label, value, color, bgColor }: any) {
  return (
    <div
      className={`${bgColor} p-6 rounded-3xl flex items-center gap-5 transition-transform hover:scale-[1.02]`}
    >
      <div className={`p-4 bg-white rounded-2xl shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 uppercase tracking-tight">
          {label}
        </p>
        <p className="text-3xl font-black text-gray-900 leading-none mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}
// "use client";

// export default function AlunoDashboard() {
//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Meu Painel de Leitor</h1>
//       <p className="text-gray-600">
//         Confira seus livros e prazos de devolução.
//       </p>

//       <div className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-400">
//         Seção de empréstimos pessoais (Em desenvolvimento)
//       </div>
//     </div>
//   );
// }
