'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Loader2,
  ArrowLeft,
  Book,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';
import Link from 'next/link';
import emprestimoService from '@/services/emprestimo-service';
import { Emprestimo } from '@/types/emprestimos';
import { toast } from 'sonner';

export default function MeusEmprestimos() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [loading, setLoading] = useState(true);
  const [renovandoId, setRenovandoId] = useState<number | null>(null);

  // Estados para o Modal de Renovação
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [empSelecionado, setEmpSelecionado] = useState<Emprestimo | null>(null);
  const [novaData, setNovaData] = useState('');

  const carregarDados = async () => {
    if (typeof window === 'undefined') return;

    setLoading(true);
    try {
      const rawData = sessionStorage.getItem('bib_user');

      if (!rawData) {
        console.warn("Chave 'bib_user' não encontrada na sessionStorage.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(rawData);
      const idPessoa = user.id_pessoa;

      if (!idPessoa) {
        console.error('id_pessoa não encontrado nos dados da sessão:', user);
        setLoading(false);
        return;
      }

      const dados = await emprestimoService.getFiltrado(
        Number(idPessoa),
        'todos'
      );
      setEmprestimos(dados || []);
    } catch (error) {
      console.error('Erro ao carregar dados da sessão:', error);
      toast.error('Erro ao identificar sua sessão de usuário.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // Função para verificar se o prazo é menor ou igual a 7 dias
  const calcularPrazoRestante = (dataPrevista: string) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prevista = new Date(dataPrevista + 'T00:00:00');

    const diferencaTempo = prevista.getTime() - hoje.getTime();
    return Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
  };

  // Função para preparar a renovação e abrir o modal
  const prepararRenovacao = (emp: Emprestimo) => {
    const dataBase = new Date(emp.data_prevista + 'T00:00:00');
    dataBase.setDate(dataBase.getDate() + 7);
    const novaDataStr = dataBase.toISOString().split('T')[0];

    setEmpSelecionado(emp);
    setNovaData(novaDataStr);
    setIsModalOpen(true);
  };

  const handleRenovacao = async () => {
    if (!empSelecionado?.id_emprestimo) return;

    setRenovandoId(empSelecionado.id_emprestimo);
    try {
      await emprestimoService.renovar(empSelecionado.id_emprestimo, novaData);
      toast.success('Empréstimo renovado com sucesso!');
      setIsModalOpen(false);
      await carregarDados();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar renovação.');
    } finally {
      setRenovandoId(null);
    }
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '--/--/----';
    try {
      const data = new Date(dataStr + 'T00:00:00');
      return data.toLocaleDateString('pt-BR');
    } catch {
      return dataStr;
    }
  };

  return (
    <div className="w-full px-8 pt-12 space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl uppercase font-bold text-gray-900 tracking-tight">
            Meus Empréstimos
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Gerencie suas leituras atuais e prazos de devolução.
          </p>
        </div>
      </div>

      {/* Tabela de Resultados */}
      <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-denin" size={40} />
            <p className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">
              Sincronizando sua estante...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Livro
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Datas de Prazo
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emprestimos.length > 0 ? (
                  emprestimos.map((emp) => {
                    const diasRestantes = calcularPrazoRestante(
                      emp.data_prevista
                    );
                    const podeRenovar = diasRestantes <= 7;

                    return (
                      <tr
                        key={emp.id_emprestimo}
                        className="hover:bg-gray-50/30 transition-colors group"
                      >
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-50 p-3 rounded-2xl text-orange-600 shrink-0">
                              <Book size={20} />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-bold text-gray-800 line-clamp-1">
                                {emp.titulo}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                Exemplar #{emp.id_exemplar}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-8">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-semibold">
                              <Calendar size={13} className="opacity-70" />
                              <span>
                                Retirada: {formatarData(emp.data_emprestimo)}
                              </span>
                            </div>
                            <div
                              className={`flex items-center gap-2 text-xs font-black px-3 py-1 rounded-lg ${
                                emp.cor === 'red'
                                  ? 'text-red-600 bg-red-50'
                                  : 'text-denin bg-blue-50'
                              }`}
                            >
                              <Clock size={13} />
                              <span>
                                Entrega: {formatarData(emp.data_prevista)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-8 text-center">
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest
                              ${emp.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
                              ${emp.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
                              ${emp.cor === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
                            `}
                          >
                            {emp.situacao}
                          </span>
                        </td>

                        <td className="px-8 py-8 text-right">
                          {emp.data_devolucao === null ? (
                            <>
                              {emp.cor !== 'red' && podeRenovar ? (
                                <button
                                  onClick={() => prepararRenovacao(emp)}
                                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-[11px] font-black transition-all bg-denin text-white hover:bg-opacity-90 active:scale-95 shadow-lg shadow-blue-100"
                                >
                                  <RefreshCw size={14} />
                                  RENOVAR LEITURA
                                </button>
                              ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                                  {emp.cor === 'red' ? (
                                    <>
                                      <AlertCircle
                                        size={14}
                                        className="text-red-500"
                                      />
                                      <span className="text-red-600">
                                        Renovação Bloqueada
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Clock size={14} />
                                      <span>Aguarde o prazo</span>
                                    </>
                                  )}
                                </span>
                              )}
                            </>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                                Devolvido
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 italic">
                                {formatarData(emp.data_devolucao)}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="bg-gray-50 p-6 rounded-full">
                          <AlertCircle size={40} className="text-gray-200" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-500 font-black uppercase text-xs tracking-[0.2em]">
                            Nenhum registro encontrado
                          </p>
                          <p className="text-gray-400 text-sm">
                            Sua estante de empréstimos está vazia no momento.
                          </p>
                        </div>
                        <Link
                          href="/acervo"
                          className="mt-4 bg-gray-900 text-white px-6 py-3 rounded-xl text-xs font-black hover:bg-black transition-all uppercase tracking-widest"
                        >
                          Explorar Acervo
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Renovação */}
      {isModalOpen && empSelecionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <RefreshCw size={32} className="text-denin" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  Confirmar Renovação?
                </h2>
                <p className="text-gray-500 text-sm font-medium">
                  Você está solicitando mais 7 dias de prazo para este livro.
                </p>
              </div>

              <div className="w-full bg-gray-50 rounded-[2rem] p-6 mt-4 space-y-4 text-left border border-gray-100">
                <div className="flex items-start gap-3">
                  <Book size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Livro
                    </p>
                    <p className="text-sm font-bold text-gray-900 line-clamp-2">
                      {empSelecionado.titulo}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Prazo Atual
                    </p>
                    <p className="text-xs font-bold text-gray-500 line-through">
                      {formatarData(empSelecionado.data_prevista)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-denin uppercase tracking-widest">
                      Novo Prazo
                    </p>
                    <p className="text-sm font-bold text-denin flex items-center gap-1">
                      <Calendar size={14} />
                      {formatarData(novaData)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full flex flex-col gap-3 pt-4">
                <button
                  onClick={handleRenovacao}
                  disabled={renovandoId !== null}
                  className="w-full bg-denin text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {renovandoId !== null ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    'Confirmar e Renovar'
                  )}
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Calendar,
//   Clock,
//   Loader2,
//   ArrowLeft,
//   Book,
//   RefreshCw,
//   AlertCircle,
// } from 'lucide-react';
// import Link from 'next/link';
// import emprestimoService from '@/services/emprestimo-service';
// import { Emprestimo } from '@/types/emprestimos';
// import { toast } from 'sonner';

// export default function MeusEmprestimos() {
//   const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [renovandoId, setRenovandoId] = useState<number | null>(null);

//   const carregarDados = async () => {
//     // Garante que o código só rode no navegador
//     if (typeof window === 'undefined') return;

//     setLoading(true);
//     try {
//       // 1. Troca de localStorage para sessionStorage
//       const rawData = sessionStorage.getItem('bib_user');

//       if (!rawData) {
//         console.warn("Chave 'bib_user' não encontrada na sessionStorage.");
//         setLoading(false);
//         return;
//       }

//       const user = JSON.parse(rawData);
//       const idPessoa = user.id_pessoa;

//       if (!idPessoa) {
//         console.error('id_pessoa não encontrado nos dados da sessão:', user);
//         setLoading(false);
//         return;
//       }

//       // 2. Busca os dados no service
//       const dados = await emprestimoService.getFiltrado(
//         Number(idPessoa),
//         'todos'
//       );
//       setEmprestimos(dados || []);
//     } catch (error) {
//       console.error('Erro ao carregar dados da sessão:', error);
//       toast.error('Erro ao identificar sua sessão de usuário.');
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     carregarDados();
//   }, []);

//   const handleRenovacao = async (emp: Emprestimo) => {
//     if (!emp.id_emprestimo) return;

//     setRenovandoId(emp.id_emprestimo);
//     try {
//       // Cálculo: Soma +7 dias à data prevista atual para enviar ao service
//       const dataBase = new Date(emp.data_prevista + 'T00:00:00');
//       dataBase.setDate(dataBase.getDate() + 7);
//       const novaDataStr = dataBase.toISOString().split('T')[0];

//       await emprestimoService.renovar(emp.id_emprestimo, novaDataStr);

//       toast.success('Empréstimo renovado com sucesso!');
//       await carregarDados(); // Atualiza a lista com as novas datas do banco
//     } catch (error: any) {
//       toast.error(error.message || 'Erro ao processar renovação.');
//     } finally {
//       setRenovandoId(null);
//     }
//   };

//   const formatarData = (dataStr: string) => {
//     if (!dataStr) return '--/--/----';
//     try {
//       const data = new Date(dataStr + 'T00:00:00');
//       return data.toLocaleDateString('pt-BR');
//     } catch {
//       return dataStr;
//     }
//   };

//   return (
//     <div className="w-full px-8 space-y-8 animate-in fade-in duration-500 pb-10">
//       {/* Cabeçalho */}
//       <div className="flex items-center gap-4">
//         <Link
//           href="/dashboard"
//           className="p-2 hover:bg-gray-100 rounded-full transition-all"
//         >
//           <ArrowLeft size={20} className="text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl uppercase font-bold text-gray-900 tracking-tight">
//             Meus Empréstimos
//           </h1>
//           <p className="text-sm text-gray-500 font-medium">
//             Gerencie suas leituras atuais e prazos de devolução.
//           </p>
//         </div>
//       </div>

//       {/* Tabela de Resultados */}
//       <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20 gap-4">
//             <Loader2 className="animate-spin text-denin" size={40} />
//             <p className="text-gray-400 font-medium font-bold uppercase text-xs tracking-widest">
//               Sincronizando sua estante...
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50/50 border-b border-gray-100">
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
//                     Livro
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
//                     Datas
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
//                     Status
//                   </th>
//                   <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
//                     Ação
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-50">
//                 {emprestimos.length > 0 ? (
//                   emprestimos.map((emp) => (
//                     <tr
//                       key={emp.id_emprestimo}
//                       className="hover:bg-gray-50/50 transition-colors group"
//                     >
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="bg-orange-50 p-2.5 rounded-xl text-orange-600">
//                             <Book size={18} />
//                           </div>
//                           <div>
//                             <p className="text-sm font-bold text-gray-800 line-clamp-1">
//                               {emp.titulo}
//                             </p>
//                             <p className="text-[10px] text-gray-500 font-medium">
//                               Exemplar #{emp.id_exemplar}
//                             </p>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex flex-col items-center gap-1 text-[11px]">
//                           <div className="flex items-center gap-1.5 text-gray-400 font-medium">
//                             <Calendar size={12} />
//                             <span>
//                               Retirada: {formatarData(emp.data_emprestimo)}
//                             </span>
//                           </div>
//                           <div
//                             className={`flex items-center gap-1.5 font-black ${emp.cor === 'red' ? 'text-red-600' : 'text-denin'}`}
//                           >
//                             <Clock size={12} />
//                             <span>
//                               Devolver até: {formatarData(emp.data_prevista)}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-center">
//                         <span
//                           className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter
//                             ${emp.cor === 'green' ? 'bg-green-100 text-green-700' : ''}
//                             ${emp.cor === 'red' ? 'bg-red-100 text-red-700' : ''}
//                             ${emp.cor === 'blue' ? 'bg-blue-100 text-blue-700' : ''}
//                           `}
//                         >
//                           {emp.situacao}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         {emp.data_devolucao === null ? (
//                           <button
//                             onClick={() => handleRenovacao(emp)}
//                             disabled={
//                               renovandoId === emp.id_emprestimo ||
//                               emp.cor === 'red'
//                             }
//                             className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all
//                               ${
//                                 emp.cor === 'red'
//                                   ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                   : 'bg-denin text-white hover:bg-opacity-90 active:scale-95 shadow-md shadow-blue-100'
//                               }
//                             `}
//                           >
//                             {renovandoId === emp.id_emprestimo ? (
//                               <Loader2 size={14} className="animate-spin" />
//                             ) : (
//                               <RefreshCw size={14} />
//                             )}
//                             {emp.cor === 'red' ? 'BLOQUEADO' : 'RENOVAR'}
//                           </button>
//                         ) : (
//                           <span className="text-[10px] font-bold text-gray-300 uppercase italic">
//                             Concluído em {formatarData(emp.data_devolucao)}
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={4} className="px-6 py-24 text-center">
//                       <div className="flex flex-col items-center gap-3">
//                         <div className="bg-gray-50 p-4 rounded-full">
//                           <AlertCircle size={32} className="text-gray-300" />
//                         </div>
//                         <div>
//                           <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
//                             Nenhum livro encontrado
//                           </p>
//                           <p className="text-gray-400 text-xs mt-1">
//                             Você não possui empréstimos ativos ou histórico
//                             registrado.
//                           </p>
//                         </div>
//                         <Link
//                           href="/acervo"
//                           className="mt-2 text-denin text-xs font-black hover:underline uppercase tracking-tighter"
//                         >
//                           Explorar Acervo →
//                         </Link>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
