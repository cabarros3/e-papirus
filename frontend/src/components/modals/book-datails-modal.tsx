'use client';

import { useEffect, useState } from 'react';
import { Livro } from '@/types/livros';
import {
  ExemplaresService,
  LivroComExemplares,
  ExemplarAgrupado,
} from '../../services/exemplar-service';
import {
  X,
  User,
  Building,
  Calendar,
  AlignLeft,
  Hash,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

interface BookDetailsModalProps {
  livro: Livro | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookDetailsModal({
  livro,
  isOpen,
  onClose,
}: BookDetailsModalProps) {
  const [loadingExemplares, setLoadingExemplares] = useState(false);
  const [dadosExemplares, setDadosExemplares] =
    useState<LivroComExemplares | null>(null);

  // ESTADO DE LOGIN REAL: Lendo do sessionStorage igual ao seu Layout
  const [estaLogado, setEstaLogado] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Verifica se existe o token e o usuário no sessionStorage
      const savedUser = sessionStorage.getItem("bib_user");
      const token = sessionStorage.getItem("bib_token");
      setEstaLogado(!!savedUser && !!token);

      if (livro?.id_livro) {
        const fetchExemplares = async () => {
          setLoadingExemplares(true);
          try {
            const res = await ExemplaresService.getExemplaresPorLivro(
              livro.id_livro
            );
            setDadosExemplares(res);
          } catch (error) {
            console.error('Erro ao buscar exemplares:', error);
          } finally {
            setLoadingExemplares(false);
          }
        };
        fetchExemplares();
      }
    } else {
      setDadosExemplares(null);
    }
  }, [isOpen, livro]);

  if (!isOpen || !livro) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 shadow-sm"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Lado Esquerdo: Capa */}
        <div className="w-full md:w-2/5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-100 shrink-0">
          <div className="relative w-full aspect-[3/4] shadow-2xl rounded-lg overflow-hidden bg-gray-200">
            {livro.capa ? (
              <img
                src={livro.capa}
                alt={livro.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase text-xs">
                Sem Capa
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito: Info */}
        <div className="w-full md:w-3/5 p-8 overflow-y-auto">
          <span className="text-xs font-bold text-denin uppercase tracking-widest bg-denin/10 px-3 py-1 rounded-full">
            {livro.nome_assunto}
          </span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {livro.titulo}
          </h2>
          <p className="text-gray-500 italic mb-6 flex items-center gap-2">
            <User size={16} /> {livro.nomes_autores}
          </p>

          <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Building size={16} className="text-denin" />{' '}
                <strong>Editora:</strong> {livro.editora}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={16} className="text-denin" />{' '}
                <strong>Ano:</strong> {livro.ano_publicacao}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
            <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
              <AlignLeft size={14} /> Resumo
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {livro.nota_resumo ||
                'Este exemplar não possui resumo cadastrado.'}
            </p>
          </div>

          {/* LISTA DE EXEMPLARES DINÂMICA */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
              <Hash size={14} className="text-denin" /> Disponibilidade
            </h4>

            {loadingExemplares ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                <Loader2 size={14} className="animate-spin" /> Verificando
                cópias...
              </div>
            ) : dadosExemplares?.exemplares &&
              dadosExemplares.exemplares.length > 0 ? (
              <div className="space-y-3">
                {dadosExemplares.exemplares.map((ex: ExemplarAgrupado) => (
                  <div
                    key={ex.id_exemplar}
                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-700">
                        Cópia #{ex.numero_exemplar}
                      </p>
                      <div
                        className={`flex items-center gap-1 text-[10px] font-bold ${ex.disponibilidade === 'disponivel' ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {ex.disponibilidade === 'disponivel' && (
                          <CheckCircle2 size={10} />
                        )}
                        {ex.disponibilidade.toUpperCase()}
                      </div>
                    </div>

                    {ex.disponibilidade === 'disponivel' && (
                      <Link
                        href={
                          estaLogado
                            ? `/dashboard/user/nova-reserva?id_livro=${livro.id_livro}&id_exemplar=${ex.id_exemplar}`
                            : `/login?redirect=/resultados?q=${livro.titulo}`
                        }
                        className="bg-denin text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-denin/90 transition-all"
                      >
                        {estaLogado ? 'Reservar' : 'Entrar'}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Sem exemplares cadastrados.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import { Livro } from "@/types/livros";
// import {
//   ExemplaresService,
//   LivroComExemplares,
//   ExemplarAgrupado,
// } from "../../services/exemplar-service";
// import {
//   X,
//   User,
//   Building,
//   Calendar,
//   AlignLeft,
//   Hash,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";
// import Link from "next/link";

// interface BookDetailsModalProps {
//   livro: Livro | null;
//   isOpen: boolean;
//   onClose: () => void;
// }

// export default function BookDetailsModal({
//   livro,
//   isOpen,
//   onClose,
// }: BookDetailsModalProps) {
//   const [loadingExemplares, setLoadingExemplares] = useState(false);
//   const [dadosExemplares, setDadosExemplares] =
//     useState<LivroComExemplares | null>(null);

//   // Simulação de login - ajuste conforme seu sistema
//   const estaLogado = false;

//   useEffect(() => {
//     if (isOpen && livro?.id_livro) {
//       const fetchExemplares = async () => {
//         setLoadingExemplares(true);
//         try {
//           const res = await ExemplaresService.getExemplaresPorLivro(
//             livro.id_livro,
//           );
//           setDadosExemplares(res);
//         } catch (error) {
//           console.error("Erro ao buscar exemplares:", error);
//         } finally {
//           setLoadingExemplares(false);
//         }
//       };
//       fetchExemplares();
//     } else {
//       setDadosExemplares(null);
//     }
//   }, [isOpen, livro]);

//   if (!isOpen || !livro) return null;

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
//       <div
//         className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <button
//           onClick={onClose}
//           className="absolute right-4 top-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 shadow-sm"
//         >
//           <X size={20} className="text-gray-500" />
//         </button>

//         {/* Lado Esquerdo: Capa */}
//         <div className="w-full md:w-2/5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-100">
//           <div className="relative w-full aspect-[3/4] shadow-2xl rounded-lg overflow-hidden">
//             {livro.capa ? (
//               <img
//                 src={livro.capa}
//                 alt={livro.titulo}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">
//                 Sem Capa
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Lado Direito: Info */}
//         <div className="w-full md:w-3/5 p-8 overflow-y-auto">
//           <span className="text-xs font-bold text-denin uppercase tracking-widest bg-denin/10 px-3 py-1 rounded-full">
//             {livro.nome_assunto}
//           </span>
//           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-2">
//             {livro.titulo}
//           </h2>
//           <p className="text-gray-500 italic mb-6 flex items-center gap-2">
//             <User size={16} /> {livro.nomes_autores}
//           </p>

//           <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
//             <div className="space-y-3">
//               <div className="flex items-center gap-2 text-gray-600">
//                 <Building size={16} className="text-denin" />{" "}
//                 <strong>Editora:</strong> {livro.editora}
//               </div>
//               <div className="flex items-center gap-2 text-gray-600">
//                 <Calendar size={16} className="text-denin" />{" "}
//                 <strong>Ano:</strong> {livro.ano_publicacao}
//               </div>
//             </div>
//           </div>

//           <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
//             <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
//               <AlignLeft size={14} /> Resumo
//             </h4>
//             <p className="text-gray-600 text-sm leading-relaxed">
//               {livro.nota_resumo ||
//                 "Este exemplar não possui resumo cadastrado no sistema."}
//             </p>
//           </div>

//           {/* LISTA DE EXEMPLARES (DINÂMICA) */}
//           <div>
//             <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 uppercase text-xs tracking-wider">
//               <Hash size={14} className="text-denin" /> Exemplares Disponíveis
//             </h4>

//             {loadingExemplares ? (
//               <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
//                 <Loader2 size={16} className="animate-spin" /> Carregando
//                 exemplares...
//               </div>
//             ) : dadosExemplares?.exemplares &&
//               dadosExemplares.exemplares.length > 0 ? (
//               <div className="space-y-3">
//                 {dadosExemplares.exemplares.map((ex: ExemplarAgrupado) => (
//                   <div
//                     key={ex.id_exemplar}
//                     className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm group"
//                   >
//                     <div>
//                       <p className="text-sm font-bold text-gray-700">
//                         Exemplar #{ex.numero_exemplar}
//                       </p>
//                       <div
//                         className={`flex items-center gap-1 text-[11px] font-bold ${ex.disponibilidade === "disponivel" ? "text-green-600" : "text-red-500"}`}
//                       >
//                         {ex.disponibilidade === "disponivel" && (
//                           <CheckCircle2 size={12} />
//                         )}
//                         {ex.disponibilidade === "disponivel"
//                           ? "DISPONÍVEL"
//                           : ex.disponibilidade.toUpperCase()}
//                       </div>
//                     </div>

//                     {ex.disponibilidade === "disponivel" && (
//                       <Link
//                         href={
//                           estaLogado
//                             ? `/dashboard/reservar?id_livro=${livro.id_livro}&id_exemplar=${ex.id_exemplar}`
//                             : `/auth/login?redirect=/dashboard/reservar?id_livro=${livro.id_livro}`
//                         }
//                         className="bg-denin text-white text-[11px] font-bold px-4 py-2 rounded-lg hover:bg-denin/90 transition-all"
//                       >
//                         {estaLogado ? "Reservar" : "Login"}
//                       </Link>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-400 italic">
//                 Nenhum exemplar físico encontrado.
//               </p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// // "use client";

// // import { Livro } from "@/types/livros";
// // import {
// //   X,
// //   Book,
// //   User,
// //   Building,
// //   Calendar,
// //   Hash,
// //   AlignLeft,
// // } from "lucide-react";
// // // import Image from "next/image";

// // interface BookDetailsModalProps {
// //   livro: Livro | null;
// //   isOpen: boolean;
// //   onClose: () => void;
// // }

// // export default function BookDetailsModal({
// //   livro,
// //   isOpen,
// //   onClose,
// // }: BookDetailsModalProps) {
// //   if (!isOpen || !livro) return null;

// //   return (
// //     <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
// //       <div
// //         className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <button
// //           onClick={onClose}
// //           className="absolute right-4 top-4 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors z-10 shadow-sm"
// //         >
// //           <X size={20} className="text-gray-500" />
// //         </button>

// //         {/* Lado Esquerdo: Capa */}
// //         <div className="w-full md:w-2/5 bg-gray-50 flex items-center justify-center p-8 border-r border-gray-100">
// //           <div className="relative w-full aspect-3/4 shadow-2xl rounded-lg overflow-hidden">
// //             {livro.capa ? (
// //               <img
// //                 src={livro.capa}
// //                 alt={livro.titulo}
// //                 className="w-full h-full object-cover"
// //               />
// //             ) : (
// //               <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold">
// //                 Sem Capa
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Lado Direito: Info */}
// //         <div className="w-full md:w-3/5 p-8 overflow-y-auto">
// //           <span className="text-xs font-bold text-denin uppercase tracking-widest bg-denin/10 px-3 py-1 rounded-full">
// //             {livro.nome_assunto}
// //           </span>
// //           <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4 mb-2">
// //             {livro.titulo}
// //           </h2>
// //           <p className="text-gray-500 italic mb-6 flex items-center gap-2">
// //             <User size={16} /> {livro.nomes_autores}
// //           </p>

// //           <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
// //             <div className="space-y-3">
// //               <div className="flex items-center gap-2 text-gray-600">
// //                 <Building size={16} className="text-denin" />{" "}
// //                 <strong>Editora:</strong> {livro.editora}
// //               </div>
// //               <div className="flex items-center gap-2 text-gray-600">
// //                 <Calendar size={16} className="text-denin" />{" "}
// //                 <strong>Ano:</strong> {livro.ano_publicacao}
// //               </div>
// //             </div>
// //             {/* <div className="space-y-3">
// //               <div className="flex items-center gap-2 text-gray-600">
// //                 <Hash size={16} className="text-denin" /> <strong>ISBN:</strong>{" "}
// //                 {livro.isbn || "N/A"}
// //               </div>
// //             </div> */}
// //           </div>

// //           <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
// //             <h4 className="font-bold text-gray-800 mb-2 flex items-center gap-2 uppercase text-xs tracking-wider">
// //               <AlignLeft size={14} /> Resumo
// //             </h4>
// //             <p className="text-gray-600 text-sm leading-relaxed">
// //               {livro.nota_resumo ||
// //                 "Este exemplar não possui resumo cadastrado no sistema."}
// //             </p>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
