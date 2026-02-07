'use client';
import React, { useEffect, useState } from 'react';
import {
  AlunoDashboardService,
  AlunoDashboardData,
} from '../../../../services/aluno-dashboard-service';
import {
  Book,
  Clock,
  History,
  AlertCircle,
  Loader2,
  ChevronRight,
} from 'lucide-react';

export default function AlunoDashboard() {
  const [dados, setDados] = useState<AlunoDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setErro(null);
        const userString = localStorage.getItem('bib_user');
        if (!userString) {
          setErro('Sessão não encontrada. Por favor, faça login.');
          return;
        }
        const user = JSON.parse(userString);
        const idPessoa = user?.id_pessoa;

        const service = new AlunoDashboardService();
        const data = await service.getStats(idPessoa);
        setDados(data);
      } catch (e) {
        setErro('Ocorreu um erro ao processar sua solicitação.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <div className="absolute inset-0 blur-xl bg-blue-400/20 animate-pulse"></div>
        </div>
        <p className="text-gray-400 font-medium mt-4 tracking-widest uppercase text-xs">
          Sincronizando biblioteca...
        </p>
      </div>
    );
  }

  if (erro || !dados) {
    return (
      <div className="p-8 py-12 max-w-7xl mx-auto animate-in fade-in zoom-in duration-500">
        <div className="bg-red-50 border border-red-200 rounded-[32px] p-12 text-center shadow-xl shadow-red-100/50">
          <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-red-800">Ops! Algo travou</h2>
          <p className="text-red-600/80 mb-8 max-w-md mx-auto font-medium">
            {erro || 'Erro desconhecido'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all active:scale-95 shadow-lg shadow-red-200"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    /* AJUSTE: px-8 (32px) para alinhamento lateral e gap-8 (32px) para ritmo vertical */
    <div className="w-full px-8 py-10 flex flex-col gap-8 animate-in fade-in duration-500 pb-10 max-w-[1600px] mx-auto overflow-hidden">
      {/* Header com 32px de respiro lateral garantido pelo container */}
      <header className="space-y-2 animate-in slide-in-from-left-8 fade-in duration-700 ease-out">
        {/* <div className="inline-block bg-blue-600 h-1.5 w-12 rounded-full mb-2"></div> */}
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">
          Meu Painel de Leitor
        </h1>
        <p className="text-lg text-gray-500 font-medium">
          Confira suas leituras e prazos de hoje.
        </p>
      </header>

      {/* Grid de Métricas - Gap de 32px (gap-8) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-75">
          <MetricCard
            icon={<Book size={26} />}
            label="Livros com Você"
            value={dados.ativos}
            color="text-blue-600"
            bgColor="bg-blue-50/50"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-150">
          <MetricCard
            icon={<AlertCircle size={26} />}
            label="Em Atraso"
            value={dados.atrasados}
            color="text-red-600"
            bgColor="bg-red-50/50"
          />
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both delay-300">
          <MetricCard
            icon={<History size={26} />}
            label="Total Lido"
            value={dados.historico_lidos}
            color="text-green-600"
            bgColor="bg-green-50/50"
          />
        </div>
      </div>

      {/* Seção de Livros */}
      <section className="space-y-8 animate-in fade-in duration-1000 delay-500 fill-mode-both">
        <div className="flex items-center justify-between border-b border-gray-100 pb-6">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            Meus Empréstimos Atuais
          </h2>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            {dados.meus_livros.length} LIVRO(S)
          </span>
        </div>

        {dados.meus_livros.length > 0 ? (
          /* Grid com gap de 32px (gap-8) */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {dados.meus_livros.map((livro, index) => (
              <div
                key={livro.id_emprestimo}
                style={{ animationDelay: `${600 + index * 100}ms` }}
                className="group flex bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
              >
                <div className="w-32 md:w-40 bg-gray-50 flex-shrink-0 overflow-hidden relative border-r border-gray-50">
                  {livro.capa ? (
                    <img
                      src={livro.capa}
                      alt={livro.titulo}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Book size={40} />
                    </div>
                  )}
                </div>

                {/* Conteúdo interno com padding de 32px (p-8) */}
                <div className="p-8 flex flex-col justify-between flex-grow relative">
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {livro.titulo}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 gap-3 font-medium">
                      <div className="p-1.5 bg-gray-50 rounded-lg">
                        <Clock size={16} className="text-blue-500" />
                      </div>
                      <span>
                        Entrega:{' '}
                        <span className="text-gray-900 font-bold tracking-tight">
                          {new Date(livro.data_prevista).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border transition-colors
                      ${
                        livro.cor === 'red'
                          ? 'bg-red-50 text-red-600 border-red-100 group-hover:bg-red-600 group-hover:text-white'
                          : livro.cor === 'orange'
                            ? 'bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-600 group-hover:text-white'
                            : 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-600 group-hover:text-white'
                      }`}
                    >
                      {livro.status_texto}
                    </span>
                    <ChevronRight
                      className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all"
                      size={20}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-20 rounded-[32px] border-2 border-dashed border-gray-200 text-center animate-in zoom-in-95 duration-1000 delay-700 fill-mode-both">
            <div className="bg-white w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gray-200/50 text-gray-200 border border-gray-50">
              <Book size={40} className="animate-bounce" />
            </div>
            <p className="text-gray-500 font-bold text-xl uppercase tracking-tight">
              Sua estante está livre
            </p>
            <p className="text-gray-400 font-medium mt-2">
              Que tal buscar uma nova aventura na biblioteca?
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Componente de Card de Métrica ajustado com p-8 (32px)
function MetricCard({ icon, label, value, color, bgColor }: any) {
  return (
    <div
      className={`${bgColor} p-8 rounded-[32px] flex items-center gap-6 border border-white shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/40 group relative overflow-hidden`}
    >
      <div
        className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-[3] ${color.replace('text', 'bg')}`}
      ></div>

      <div
        className={`p-5 bg-white rounded-[1.5rem] shadow-sm ${color} border border-gray-50 z-10 transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}
      >
        {icon}
      </div>
      <div className="space-y-1 z-10">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          {label}
        </p>
        <p className="text-5xl font-black text-gray-900 tabular-nums leading-none tracking-tighter">
          {value || 0}
        </p>
      </div>
    </div>
  );
}

// 'use client';
// import React, { useEffect, useState } from 'react';
// import {
//   AlunoDashboardService,
//   AlunoDashboardData,
// } from '../../../../services/aluno-dashboard-service';
// import { Book, Clock, History, AlertCircle, Loader2 } from 'lucide-react';

// export default function AlunoDashboard() {
//   const [dados, setDados] = useState<AlunoDashboardData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [erro, setErro] = useState<string | null>(null);

//   useEffect(() => {
//     async function loadData() {
//       try {
//         setLoading(true);
//         setErro(null);

//         // 1. Busca no LocalStorage com a chave correta bib_user
//         const userString = localStorage.getItem('bib_user');

//         if (!userString) {
//           setErro('Sessão não encontrada. Por favor, faça login.');
//           return;
//         }

//         // 2. Tenta fazer o parse e extrair o id_pessoa
//         const user = JSON.parse(userString);
//         const idPessoa = user?.id_pessoa;

//         if (!idPessoa) {
//           setErro('ID do usuário não identificado.');
//           return;
//         }

//         // 3. Chamada ao service
//         const service = new AlunoDashboardService();
//         const data = await service.getStats(idPessoa);

//         if (data) {
//           setDados(data);
//         } else {
//           setErro('Não foi possível carregar os dados do servidor.');
//         }
//       } catch (e) {
//         console.error('Erro no Dashboard:', e);
//         setErro('Ocorreu um erro ao processar sua solicitação.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     loadData();
//   }, []);

//   // --- RENDERIZAÇÃO DE ESTADOS DE CARGA E ERRO ---

//   if (loading) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
//         <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
//         <p className="text-gray-500 font-medium">Carregando seus dados...</p>
//       </div>
//     );
//   }

//   if (erro || !dados) {
//     return (
//       <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
//         <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center ">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <h2 className="text-lg font-bold text-red-800">
//             Ops! Algo deu errado
//           </h2>
//           <p className="text-red-600 mb-6">{erro || 'Erro desconhecido'}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             Tentar Novamente
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- RENDERIZAÇÃO DO DASHBOARD ---

//   return (
//     <div className="p-6 max-w-7xl mx-auto space-y-8">
//       <header>
//         <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
//           Meu Painel de Leitor
//         </h1>
//         <p className="text-gray-500 mt-1">Bem-vindo(a) de volta!</p>
//       </header>

//       {/* Cards de Métricas */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <MetricCard
//           icon={<Book size={24} />}
//           label="Livros com Você"
//           value={dados.ativos}
//           color="text-blue-600"
//           bgColor="bg-blue-50"
//         />
//         <MetricCard
//           icon={<AlertCircle size={24} />}
//           label="Em Atraso"
//           value={dados.atrasados}
//           color="text-red-600"
//           bgColor="bg-red-50"
//         />
//         <MetricCard
//           icon={<History size={24} />}
//           label="Total Lido"
//           value={dados.historico_lidos}
//           color="text-green-600"
//           bgColor="bg-green-50"
//         />
//       </div>

//       {/* Lista de Livros Atuais */}
//       <section className="space-y-4">
//         <div className="flex items-center justify-between border-b pb-2">
//           <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
//             Meus Empréstimos Atuais
//           </h2>
//           <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
//             {dados.meus_livros.length} livro(s)
//           </span>
//         </div>

//         {dados.meus_livros.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {dados.meus_livros.map((livro) => (
//               <div
//                 key={livro.id_emprestimo}
//                 className="flex bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
//               >
//                 <div className="w-28 bg-gray-50 flex-shrink-0 border-r border-gray-50">
//                   {livro.capa ? (
//                     <img
//                       src={livro.capa}
//                       alt={livro.titulo}
//                       className="w-full h-full object-cover shadow-inner"
//                     />
//                   ) : (
//                     <div className="w-full h-full flex items-center justify-center text-gray-300">
//                       <Book size={32} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="p-5 flex flex-col justify-between flex-grow">
//                   <div>
//                     <h3 className="font-bold text-gray-900 leading-snug mb-1">
//                       {livro.titulo}
//                     </h3>
//                     <div className="flex items-center text-xs text-gray-500 gap-1">
//                       <Clock size={12} />
//                       <span>
//                         Entrega:{' '}
//                         {new Date(livro.data_prevista).toLocaleDateString(
//                           'pt-BR'
//                         )}
//                       </span>
//                     </div>
//                   </div>

//                   <div
//                     className={`mt-3 text-xs font-extrabold px-3 py-1.5 rounded-full w-fit uppercase tracking-wider
//                     ${
//                       livro.cor === 'red'
//                         ? 'bg-red-100 text-red-600'
//                         : livro.cor === 'orange'
//                           ? 'bg-orange-100 text-orange-600'
//                           : 'bg-blue-100 text-blue-600'
//                     }`}
//                   >
//                     {livro.status_texto}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="bg-gray-50 p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center">
//             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-gray-300">
//               <Book size={28} />
//             </div>
//             <p className="text-gray-500 font-medium">
//               Você não possui empréstimos ativos no momento.
//             </p>
//           </div>
//         )}
//       </section>
//     </div>
//   );
// }

// // Componente de Card Reutilizável
// function MetricCard({ icon, label, value, color, bgColor }: any) {
//   return (
//     <div
//       className={`${bgColor} p-6 rounded-3xl flex items-center gap-5 transition-transform hover:scale-[1.02]`}
//     >
//       <div className={`p-4 bg-white rounded-2xl shadow-sm ${color}`}>
//         {icon}
//       </div>
//       <div>
//         <p className="text-sm font-semibold text-gray-600 uppercase tracking-tight">
//           {label}
//         </p>
//         <p className="text-3xl font-black text-gray-900 leading-none mt-1">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // export default function AlunoDashboard() {
// //   return (
// //     <div className="space-y-6">
// //       <h1 className="text-2xl font-bold">Meu Painel de Leitor</h1>
// //       <p className="text-gray-600">
// //         Confira seus livros e prazos de devolução.
// //       </p>

// //       <div className="bg-white p-10 rounded-xl border-2 border-dashed border-gray-200 text-center text-gray-400">
// //         Seção de empréstimos pessoais (Em desenvolvimento)
// //       </div>
// //     </div>
// //   );
// // }
