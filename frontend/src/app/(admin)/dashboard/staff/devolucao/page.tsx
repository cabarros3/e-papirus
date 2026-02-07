"use client";

import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  User,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// Serviços e Tipos
import emprestimoService from "@/services/emprestimo-service";
import { pessoaService } from "@/services/pessoa-service";
import { Pessoa } from "@/types/pessoas";

// Componentes Reutilizados e Modais
import { UserSearchInput } from "@/components/inputs/UserSearchInput";
import { ConfirmDevolucaoModal } from "@/components/modals/confirm-devolucao-modal";
import { ResumoDevolucaoModal } from "@/components/modals/resumo-devolucao-modal";

export default function DevolucaoPage() {
  const [loading, setLoading] = useState(true);
  const [loadingLivros, setLoadingLivros] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de Dados
  const [estudantes, setEstudantes] = useState<Pessoa[]>([]);
  const [usuario, setUsuario] = useState({ id: "", nome: "" });
  const [emprestimosAtivos, setEmprestimosAtivos] = useState<any[]>([]);

  // Estados de Seleção e Modais
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResumoOpen, setIsResumoOpen] = useState(false);
  const [itensDevolvidos, setItensDevolvidos] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const lista = await pessoaService.listar();
        setEstudantes(lista || []);
      } catch (e) {
        console.error("Erro ao carregar lista de usuários");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!usuario.id) {
      setEmprestimosAtivos([]);
      setSelecionados([]);
      return;
    }

    const buscarLivros = async () => {
      setLoadingLivros(true);
      try {
        const dados = await emprestimoService.getFiltrado(
          Number(usuario.id),
          "pendente",
        );
        setEmprestimosAtivos(dados);
      } catch (e) {
        console.error("Erro ao buscar livros do usuário");
      } finally {
        setLoadingLivros(false);
      }
    };
    buscarLivros();
  }, [usuario.id]);

  const toggleSelecao = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleProcessarDevolucao = async () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);
    const concluidos: any[] = [];
    try {
      await Promise.all(
        selecionados.map(async (id) => {
          const item = emprestimosAtivos.find((e) => e.id_emprestimo === id);
          await emprestimoService.devolver(id);
          concluidos.push(item);
        }),
      );
      setItensDevolvidos(concluidos);
      setIsResumoOpen(true);
      setEmprestimosAtivos((prev) =>
        prev.filter((e) => !selecionados.includes(e.id_emprestimo)),
      );
      setSelecionados([]);
    } catch (error) {
      console.error("Erro no processamento.");
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
      <ConfirmDevolucaoModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleProcessarDevolucao}
        quantidade={selecionados.length}
        loading={isSubmitting}
      />

      <ResumoDevolucaoModal
        isOpen={isResumoOpen}
        onClose={() => setIsResumoOpen(false)}
        usuarioNome={usuario.nome}
        dados={itensDevolvidos}
      />

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
            Devolução de Livros
          </h1>
          <p className="text-sm text-gray-500 font-medium font-sans">
            Selecione o leitor e os exemplares para devolver.
          </p>
        </div>
      </div>

      {/* CARD PRINCIPAL EM GRID */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[500px]">
        {/* COLUNA ESQUERDA: BUSCA (Lado do Formulário de Empréstimo) */}
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
              <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 animate-in zoom-in-95">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                  Leitor ativo
                </p>
                <p className="text-xl font-poppins font-bold text-gray-800">
                  {usuario.nome}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={isSubmitting || selecionados.length === 0 || !usuario.id}
            className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold shadow-xl shadow-blue-100 disabled:opacity-40 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-auto"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                Finalizar Devolução ({selecionados.length})
              </>
            )}
          </button>
        </div>

        {/* COLUNA DIREITA: SELEÇÃO (Lado da Cesta de Empréstimo) */}
        <div className="space-y-6 md:pl-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-poppins font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={14} /> Livros Pendentes
            </h2>
          </div>

          <div className="flex-1 flex flex-col space-y-3">
            {loadingLivros ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2 py-20">
                <Loader2 className="animate-spin text-blue-600" size={32} />
                <p className="text-xs text-gray-400 font-medium">
                  Buscando pendências...
                </p>
              </div>
            ) : emprestimosAtivos.length > 0 ? (
              <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {emprestimosAtivos.map((emp) => (
                  <div
                    key={emp.id_emprestimo}
                    onClick={() => toggleSelecao(emp.id_emprestimo)}
                    className={`flex items-center gap-4 p-5 rounded-3xl cursor-pointer border transition-all ${selecionados.includes(emp.id_emprestimo)
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                        : "border-gray-100 bg-gray-50/50 hover:border-gray-300 hover:bg-white"
                      }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${selecionados.includes(emp.id_emprestimo)
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-200"
                        }`}
                    >
                      {selecionados.includes(emp.id_emprestimo) && (
                        <CheckCircle2 size={14} className="text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-poppins font-bold text-[13px] text-gray-800 leading-tight">
                        {emp.titulo}
                      </p>
                      <p
                        className={`text-[10px] font-bold mt-1 uppercase ${emp.cor === "red" ? "text-red-500" : "text-blue-500"}`}
                      >
                        Vencimento:{" "}
                        {new Date(emp.data_prevista).toLocaleDateString()}
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
                    ? "Nenhum livro pendente!"
                    : "Aguardando seleção do leitor"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import {
//   ArrowLeft,
//   Loader2,
//   BookOpen,
//   Calendar,
//   CheckCircle2,
//   User,
//   Square,
//   CheckSquare,
//   AlertCircle,
// } from "lucide-react";
// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { toast } from "sonner";

// // Serviços e Tipos
// import emprestimoService, { Emprestimo } from "@/services/emprestimo-service";
// import { pessoaService } from "@/services/pessoa-service";
// import { Pessoa } from "@/types/pessoas";

// // Componentes Reutilizados e Modais
// import { UserSearchInput } from "@/components/inputs/UserSearchInput";
// import { ConfirmDevolucaoModal } from "@/components/modals/confirm-devolucao-modal";
// import { ResumoDevolucaoModal } from "@/components/modals/resumo-devolucao-modal";

// export default function DevolucaoPage() {
//   const [loading, setLoading] = useState(true);
//   const [loadingLivros, setLoadingLivros] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Estados de Dados
//   const [estudantes, setEstudantes] = useState<Pessoa[]>([]);
//   const [usuario, setUsuario] = useState({ id: "", nome: "" });
//   const [emprestimosAtivos, setEmprestimosAtivos] = useState<any[]>([]);

//   // Estados de Seleção e Modais
//   const [selecionados, setSelecionados] = useState<number[]>([]);
//   const [isConfirmOpen, setIsConfirmOpen] = useState(false);
//   const [isResumoOpen, setIsResumoOpen] = useState(false);
//   const [itensDevolvidos, setItensDevolvidos] = useState<any[]>([]);

//   // 1. Carregar lista de usuários para o SearchInput
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const lista = await pessoaService.listar();
//         setEstudantes(lista || []);
//       } catch (e) {
//         toast.error("Erro ao carregar lista de usuários");
//       } finally {
//         setLoading(false);
//       }
//     };
//     init();
//   }, []);

//   // 2. Buscar empréstimos ativos quando o usuário é selecionado
//   useEffect(() => {
//     if (!usuario.id) {
//       setEmprestimosAtivos([]);
//       setSelecionados([]);
//       return;
//     }

//     const buscarLivros = async () => {
//       setLoadingLivros(true);
//       try {
//         const dados = await emprestimoService.getFiltrado(
//           Number(usuario.id),
//           "pendente",
//         );
//         setEmprestimosAtivos(dados);
//       } catch (e) {
//         toast.error("Erro ao buscar livros do usuário");
//       } finally {
//         setLoadingLivros(false);
//       }
//     };
//     buscarLivros();
//   }, [usuario.id]);

//   // Lógica de Seleção
//   const toggleSelecao = (id: number) => {
//     setSelecionados((prev) =>
//       prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
//     );
//   };

//   const toggleTodos = () => {
//     if (selecionados.length === emprestimosAtivos.length) {
//       setSelecionados([]);
//     } else {
//       setSelecionados(emprestimosAtivos.map((e) => e.id_emprestimo));
//     }
//   };

//   // 3. Processar Devolução (Chamada pelo Modal de Confirmação)
//   const handleProcessarDevolucao = async () => {
//     setIsConfirmOpen(false);
//     setIsSubmitting(true);

//     const concluidos: any[] = [];
//     try {
//       // Executa as devoluções em paralelo
//       await Promise.all(
//         selecionados.map(async (id) => {
//           const item = emprestimosAtivos.find((e) => e.id_emprestimo === id);
//           await emprestimoService.devolver(id);
//           concluidos.push(item);
//         }),
//       );

//       setItensDevolvidos(concluidos);
//       setIsResumoOpen(true);

//       // Atualiza lista na tela
//       setEmprestimosAtivos((prev) =>
//         prev.filter((e) => !selecionados.includes(e.id_emprestimo)),
//       );
//       setSelecionados([]);
//       // toast.success("Operação realizada com sucesso!");
//     } catch (error: any) {
//       toast.error("Erro ao processar uma ou mais devoluções.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="h-screen flex items-center justify-center">
//         <Loader2 className="animate-spin text-denin" size={40} />
//       </div>
//     );

//   return (
//     <div className="max-w-4xl mx-auto space-y-8 p-4 animate-in fade-in duration-500">
//       {/* MODAIS */}
//       <ConfirmDevolucaoModal
//         isOpen={isConfirmOpen}
//         onClose={() => setIsConfirmOpen(false)}
//         onConfirm={handleProcessarDevolucao}
//         quantidade={selecionados.length}
//         loading={isSubmitting}
//       />

//       <ResumoDevolucaoModal
//         isOpen={isResumoOpen}
//         onClose={() => setIsResumoOpen(false)}
//         usuarioNome={usuario.nome}
//         dados={itensDevolvidos}
//       />

//       {/* CABEÇALHO */}
//       <div className="flex items-center gap-4">
//         <Link
//           href="/dashboard/staff/"
//           className="p-2 hover:bg-gray-100 rounded-full transition-all"
//         >
//           <ArrowLeft size={20} className="text-gray-500" />
//         </Link>
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Devolução de Livros
//           </h1>
//           <p className="text-sm text-gray-500 font-medium">
//             Selecione o leitor e os exemplares para devolver.
//           </p>
//         </div>
//       </div>

//       <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
//         {/* COLUNA ESQUERDA: BUSCA */}
//         <div className="space-y-6">
//           <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
//             <User size={14} /> Identificação
//           </h2>

//           <UserSearchInput
//             usuarios={estudantes}
//             selecionadoId={usuario.id}
//             selecionadoNome={usuario.nome}
//             onSelect={(u) =>
//               setUsuario({ id: String(u.id_pessoa), nome: u.nome })
//             }
//           />

//           {usuario.id && (
//             <div className="p-5 bg-denin/5 rounded-3xl border border-denin/10 animate-in zoom-in-95">
//               <p className="text-[10px] font-black text-denin uppercase tracking-wider mb-1">
//                 Leitor ativo
//               </p>
//               <p className="text-xl font-bold text-gray-800">{usuario.nome}</p>
//             </div>
//           )}
//         </div>

//         {/* COLUNA DIREITA: LISTAGEM E SELEÇÃO */}
//         <div className="space-y-6">
//           <div className="flex items-center justify-between">
//             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
//               <BookOpen size={14} /> Livros Pendentes
//             </h2>
//             {emprestimosAtivos.length > 1 && (
//               <button
//                 onClick={toggleTodos}
//                 className="text-[10px] font-bold text-denin uppercase hover:text-blue-800 transition-colors"
//               >
//                 {selecionados.length === emprestimosAtivos.length
//                   ? "Desmarcar todos"
//                   : "Selecionar todos"}
//               </button>
//             )}
//           </div>

//           <div className="space-y-3 min-h-[300px] flex flex-col">
//             {loadingLivros ? (
//               <div className="flex-1 flex flex-col items-center justify-center gap-2">
//                 <Loader2 className="animate-spin text-denin" size={32} />
//                 <p className="text-xs text-gray-400">Buscando pendências...</p>
//               </div>
//             ) : emprestimosAtivos.length > 0 ? (
//               <>
//                 <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
//                   {emprestimosAtivos.map((emp) => (
//                     <div
//                       key={emp.id_emprestimo}
//                       onClick={() => toggleSelecao(emp.id_emprestimo)}
//                       className={`group flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all ${
//                         selecionados.includes(emp.id_emprestimo)
//                           ? "border-denin bg-blue-50 ring-1 ring-denin"
//                           : "border-gray-100 hover:border-gray-300 bg-gray-50/30"
//                       }`}
//                     >
//                       <div className="transition-transform group-active:scale-90">
//                         {selecionados.includes(emp.id_emprestimo) ? (
//                           <CheckSquare className="text-denin" size={22} />
//                         ) : (
//                           <Square className="text-gray-300" size={22} />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <p className="font-bold text-sm text-gray-800 leading-tight">
//                           {emp.titulo}
//                         </p>
//                         <p
//                           className={`text-[10px] font-bold mt-0.5 ${emp.cor === "red" ? "text-red-500" : "text-blue-600"}`}
//                         >
//                           {emp.situacao} —{" "}
//                           {new Date(emp.data_prevista).toLocaleDateString()}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => setIsConfirmOpen(true)}
//                   disabled={selecionados.length === 0 || isSubmitting}
//                   className="w-full mt-auto bg-denin text-white py-5 rounded-3xl font-bold shadow-xl shadow-denin/20 flex items-center justify-center gap-3 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
//                 >
//                   {isSubmitting ? (
//                     <Loader2 className="animate-spin" />
//                   ) : (
//                     <CheckCircle2 size={20} />
//                   )}
//                   Confirmar Devolução ({selecionados.length})
//                 </button>
//               </>
//             ) : usuario.id ? (
//               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-100 rounded-[2rem]">
//                 <AlertCircle size={40} className="text-gray-200 mb-2" />
//                 <p className="text-gray-400 text-sm font-medium">
//                   Tudo em dia!
//                   <br />
//                   Nenhum livro pendente.
//                 </p>
//               </div>
//             ) : (
//               <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
//                 <BookOpen size={48} className="text-gray-300 mb-2" />
//                 <p className="text-sm text-gray-400">
//                   Aguardando seleção de usuário
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }