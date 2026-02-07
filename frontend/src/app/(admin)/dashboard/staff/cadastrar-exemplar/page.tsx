'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  ExemplaresService,
  LivroComExemplares,
  ExemplarAgrupado,
} from '@/services/exemplar-service';
import { BookService } from '@/services/book-service';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  Edit3,
  X,
  Save,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Book,
  ArrowLeft,
} from 'lucide-react';

export default function GerenciarExemplares() {
  const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
  const [livrosComExemplares, setLivrosComExemplares] = useState<
    LivroComExemplares[]
  >([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const bookService = useMemo(() => new BookService(), []);

  const [idLivro, setIdLivro] = useState('');
  const [localizacao, setLocalizacao] = useState('');
  const [tempData, setTempData] = useState<Partial<ExemplarAgrupado>>({});

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este exemplar?')) return;

    try {
      await ExemplaresService.deleteExemplar(id);
      toast.success('Exemplar excluído com sucesso!');
      await loadExemplares(); // Recarrega a lista após excluir
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir exemplar');
      console.error('Erro ao deletar:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [livrosData, livrosComExemplaresData] = await Promise.all([
        bookService.getAllBooks(),
        ExemplaresService.getLivrosComExemplares(),
      ]);
      setLivrosDisponiveis(livrosData);
      setLivrosComExemplares(livrosComExemplaresData);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const loadExemplares = async () => {
    try {
      const livrosData = await ExemplaresService.getLivrosComExemplares();
      setLivrosComExemplares(livrosData);
    } catch (error) {
      toast.error('Erro ao carregar exemplares');
    }
  };

  const toggleBook = (idLivro: number) => {
    const newExpanded = new Set(expandedBooks);
    newExpanded.has(idLivro)
      ? newExpanded.delete(idLivro)
      : newExpanded.add(idLivro);
    setExpandedBooks(newExpanded);
  };

  const handleAdd = async () => {
    if (!idLivro || !localizacao) {
      toast.error('Preencha todos os campos');
      return;
    }
    try {
      await ExemplaresService.createExemplar({
        id_livro: parseInt(idLivro),
        localizacao: localizacao,
        disponibilidade: 'disponivel',
      });
      toast.success('Exemplar cadastrado!');
      setIdLivro('');
      setLocalizacao('');
      await loadExemplares();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar');
    }
  };

  const handleSave = async (idExemplar: number, idLivro: number) => {
    try {
      await ExemplaresService.updateExemplar({
        id_exemplar: idExemplar,
        id_livro: idLivro,
        localizacao: tempData.localizacao!,
        disponibilidade: tempData.disponibilidade!,
      });
      toast.success('Atualizado!');
      setEditingId(null);
      await loadExemplares();
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const getDisponibilidadeColor = (disp: string) => {
    switch (disp) {
      case 'disponivel':
        return 'text-green-600 bg-green-50';
      case 'emprestado':
        return 'text-blue-600 bg-blue-50';
      case 'reservado':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        Carregando...
      </div>
    );

  return (
    // Alterado para px-8 (32px)
    <div className="min-h-screen bg-gray-50 py-2 px-8 font-sans text-gray-700">
      <div className="max-w-7xl mx-auto">
        {/* Header - Alinhamento idêntico ao "Consulta ao Acervo" */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard/staff"
            className="p-2 hover:bg-gray-100 rounded-full transition-all"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-poppins font-bold text-gray-900 uppercase tracking-tight">
              Gerenciar Exemplares
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Categorização de acervo e controle de localização.
            </p>
          </div>
        </div>

        {/* Form Section - px-8 interno para manter os 32px */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-100">
          <h2 className="text-xs font-poppins font-bold text-gray-400 uppercase tracking-widest mb-6">
            Novo Exemplar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">
                Nome da Obra
              </label>
              <div className="relative">
                <select
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl appearance-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={idLivro}
                  onChange={(e) => setIdLivro(e.target.value)}
                >
                  <option value="">Selecione uma obra</option>
                  {livrosDisponiveis.map((livro) => (
                    <option key={livro.id_livro} value={livro.id_livro}>
                      {livro.titulo}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-600 mb-2 ml-1">
                Localização
              </label>
              <input
                type="text"
                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Ex: Biblioteca Central"
              />
            </div>

            <div className="md:col-span-2">
              <button
                onClick={handleAdd}
                className="w-full h-11 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-100"
              >
                <Plus className="w-5 h-5" />
                Adicionar
              </button>
            </div>
          </div>
        </div>

        {/* Lista agrupada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {livrosComExemplares.length === 0 ? (
            <div className="px-8 py-12 text-center text-gray-400">
              Nenhum registro encontrado.
            </div>
          ) : (
            livrosComExemplares.map((livro) => (
              <div
                key={livro.id_livro}
                className="border-b border-gray-100 last:border-b-0"
              >
                <div
                  className="flex items-center gap-4 px-8 py-5 hover:bg-gray-50/50 cursor-pointer transition-colors"
                  onClick={() => toggleBook(livro.id_livro)}
                >
                  {expandedBooks.has(livro.id_livro) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div className="p-2.5 bg-blue-50 rounded-xl">
                    <Book className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-poppins font-semibold text-gray-800 tracking-tight">
                      {livro.titulo}
                    </h3>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">
                      {livro.editora}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[11px] font-bold">
                    {livro.exemplares.length}{' '}
                    {livro.exemplares.length === 1 ? 'Exemplar' : 'Exemplares'}
                  </span>
                </div>

                {expandedBooks.has(livro.id_livro) && (
                  <div className="overflow-x-auto border-t border-gray-50">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/50">
                        <tr className="text-gray-400 font-bold text-[11px] uppercase tracking-widest">
                          <th className="px-8 py-4 text-left">Nº Exemplar</th>
                          <th className="px-8 py-4 text-left">Localização</th>
                          <th className="px-8 py-4 text-left">Status</th>
                          <th className="px-8 py-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {livro.exemplares.map((exemplar) => (
                          <tr
                            key={exemplar.id_exemplar}
                            className="group hover:bg-gray-50/30 transition-colors"
                          >
                            <td className="px-8 py-4 font-mono text-xs text-gray-500">
                              #{exemplar.numero_exemplar}
                            </td>
                            <td className="px-8 py-4 text-gray-600">
                              {editingId === exemplar.id_exemplar ? (
                                <input
                                  className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                  value={tempData.localizacao || ''}
                                  onChange={(e) =>
                                    setTempData({
                                      ...tempData,
                                      localizacao: e.target.value,
                                    })
                                  }
                                />
                              ) : (
                                exemplar.localizacao
                              )}
                            </td>
                            <td className="px-8 py-4">
                              {editingId === exemplar.id_exemplar ? (
                                <select
                                  className="w-full p-2 border rounded-lg outline-none"
                                  value={tempData.disponibilidade || ''}
                                  onChange={(e) =>
                                    setTempData({
                                      ...tempData,
                                      disponibilidade: e.target.value as any,
                                    })
                                  }
                                >
                                  <option value="disponivel">Disponível</option>
                                  <option value="emprestado">Emprestado</option>
                                  <option value="reservado">Reservado</option>
                                </select>
                              ) : (
                                <span
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${getDisponibilidadeColor(exemplar.disponibilidade)}`}
                                >
                                  {exemplar.disponibilidade}
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {editingId === exemplar.id_exemplar ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        handleSave(
                                          exemplar.id_exemplar,
                                          livro.id_livro
                                        )
                                      }
                                      className="text-green-600 p-1.5 hover:bg-green-50 rounded-lg"
                                    >
                                      <Save size={18} />
                                    </button>
                                    <button
                                      onClick={() => setEditingId(null)}
                                      className="text-gray-400 p-1.5 hover:bg-gray-100 rounded-lg"
                                    >
                                      <X size={18} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingId(exemplar.id_exemplar);
                                        setTempData(exemplar);
                                      }}
                                      className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg"
                                    >
                                      <Edit3 size={18} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDelete(exemplar.id_exemplar)
                                      }
                                      className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useState, useMemo } from "react";
// import {
//   ExemplaresService,
//   LivroComExemplares,
//   ExemplarAgrupado
// } from "@/services/exemplar-service";
// import { BookService } from "@/services/book-service";
// import { toast } from "sonner";
// import {
//   Edit3,
//   X,
//   Save,
//   Plus,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
//   Book,
// } from "lucide-react";

// export default function GerenciarExemplares() {
//   const [livrosDisponiveis, setLivrosDisponiveis] = useState<any[]>([]);
//   const [livrosComExemplares, setLivrosComExemplares] = useState<LivroComExemplares[]>([]);
//   const [expandedBooks, setExpandedBooks] = useState<Set<number>>(new Set());
//   const [loading, setLoading] = useState(true);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const bookService = useMemo(() => new BookService(), []);

//   // Formulário para adicionar
//   const [idLivro, setIdLivro] = useState("");
//   const [localizacao, setLocalizacao] = useState("");

//   // Dados temporários para edição
//   const [tempData, setTempData] = useState<Partial<ExemplarAgrupado>>({});

//   // Carregar dados
//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [livrosData, livrosComExemplaresData] = await Promise.all([
//         bookService.getAllBooks(),
//         ExemplaresService.getLivrosComExemplares()
//       ]);
//       setLivrosDisponiveis(livrosData);
//       setLivrosComExemplares(livrosComExemplaresData);

//       // Expandir todos os livros por padrão
//       const allIds = new Set(livrosComExemplaresData.map((l) => l.id_livro));
//       setExpandedBooks(allIds);
//     } catch (error) {
//       toast.error("Erro ao carregar dados");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadExemplares = async () => {
//     try {
//       const livrosData = await ExemplaresService.getLivrosComExemplares();
//       setLivrosComExemplares(livrosData);
//     } catch (error) {
//       toast.error("Erro ao carregar exemplares");
//       console.error(error);
//     }
//   };

//   // Toggle expandir/colapsar livro
//   const toggleBook = (idLivro: number) => {
//     const newExpanded = new Set(expandedBooks);
//     if (newExpanded.has(idLivro)) {
//       newExpanded.delete(idLivro);
//     } else {
//       newExpanded.add(idLivro);
//     }
//     setExpandedBooks(newExpanded);
//   };

//   // Adicionar novo exemplar
//   const handleAdd = async () => {
//     if (!idLivro || !localizacao) {
//       toast.error("Preencha todos os campos");
//       return;
//     }

//     try {
//       await ExemplaresService.createExemplar({
//         id_livro: parseInt(idLivro),
//         localizacao: localizacao,
//         disponibilidade: "disponivel"
//       });

//       toast.success("Exemplar cadastrado com sucesso!");
//       setIdLivro("");
//       setLocalizacao("");
//       await loadExemplares();
//     } catch (error: any) {
//       toast.error(error.message || "Erro ao cadastrar exemplar");
//     }
//   };

//   // Iniciar edição
//   const handleEdit = (exemplar: ExemplarAgrupado) => {
//     setEditingId(exemplar.id_exemplar);
//     setTempData({ ...exemplar });
//   };

//   // Salvar edição
//   const handleSave = async (idExemplar: number, idLivro: number) => {
//     if (!tempData.localizacao || !tempData.disponibilidade) {
//       toast.error("Preencha todos os campos");
//       return;
//     }

//     try {
//       await ExemplaresService.updateExemplar({
//         id_exemplar: idExemplar,
//         id_livro: idLivro,
//         localizacao: tempData.localizacao,
//         disponibilidade: tempData.disponibilidade
//       });

//       toast.success("Exemplar atualizado com sucesso!");
//       setEditingId(null);
//       setTempData({});
//       await loadExemplares();
//     } catch (error: any) {
//       toast.error(error.message || "Erro ao atualizar exemplar");
//       console.error('Erro ao atualizar:', error);
//     }
//   };

//   // Cancelar edição
//   const handleCancel = () => {
//     setEditingId(null);
//     setTempData({});
//   };

//   // Deletar exemplar
//   const handleDelete = async (id: number) => {
//     if (!confirm("Tem certeza que deseja excluir este exemplar?")) return;

//     try {
//       await ExemplaresService.deleteExemplar(id);
//       toast.success("Exemplar excluído com sucesso!");
//       await loadExemplares();
//     } catch (error: any) {
//       toast.error(error.message || "Erro ao excluir exemplar");
//       console.error('Erro ao deletar:', error);
//     }
//   };

//   // Cor da badge de disponibilidade
//   const getDisponibilidadeColor = (disp: string) => {
//     switch (disp) {
//       case 'disponivel': return 'text-green-600 bg-green-50';
//       case 'emprestado': return 'text-blue-600 bg-blue-50';
//       case 'reservado': return 'text-yellow-600 bg-yellow-50';
//       default: return 'text-gray-600 bg-gray-50';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-gray-600">Carregando...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold text-gray-800 mb-1">
//             Gerenciar Exemplares
//           </h1>
//           <p className="text-sm text-gray-500">
//             Categorização de acervo.
//           </p>
//         </div>

//         {/* Form Section */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <h2 className="text-sm font-medium text-gray-700 mb-4">
//             NOVO EXEMPLAR
//           </h2>

//           <div className="flex gap-4 items-end">
//             <div className="flex-1">
//               <label className="block text-sm text-gray-600 mb-2">
//                 Nome da Obra
//               </label>
//               <div className="relative">
//                 <select
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg appearance-none bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   value={idLivro}
//                   onChange={(e) => setIdLivro(e.target.value)}
//                 >
//                   <option value="">Selecione uma obra</option>
//                   {livrosDisponiveis.map((livro) => (
//                     <option key={livro.id_livro} value={livro.id_livro}>
//                       {livro.titulo}
//                     </option>
//                   ))}
//                 </select>
//                 <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div className="flex-1">
//               <label className="block text-sm text-gray-600 mb-2">
//                 Localização
//               </label>
//               <input
//                 type="text"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 value={localizacao}
//                 onChange={(e) => setLocalizacao(e.target.value)}
//                 placeholder="Ex: Biblioteca Central"
//               />
//             </div>

//             <button
//               onClick={handleAdd}
//               className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
//             >
//               <Plus className="w-5 h-5" />
//               Adicionar
//             </button>
//           </div>
//         </div>

//         {/* Lista agrupada por livro */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {livrosComExemplares.length === 0 ? (
//             <div className="px-6 py-12 text-center text-gray-500">
//               Nenhum livro com exemplares cadastrado
//             </div>
//           ) : (
//             livrosComExemplares.map((livro) => (
//               <div key={livro.id_livro} className="border-b border-gray-200 last:border-b-0">
//                 {/* Header do Livro */}
//                 <div
//                   className="flex items-center gap-3 px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
//                   onClick={() => toggleBook(livro.id_livro)}
//                 >
//                   {expandedBooks.has(livro.id_livro) ? (
//                     <ChevronDown className="w-5 h-5 text-gray-500" />
//                   ) : (
//                     <ChevronRight className="w-5 h-5 text-gray-500" />
//                   )}
//                   <Book className="w-5 h-5 text-blue-600" />
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-800">{livro.titulo}</h3>
//                     <p className="text-sm text-gray-500">{livro.editora}</p>
//                   </div>
//                   <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
//                     {livro.exemplares.length} {livro.exemplares.length === 1 ? 'exemplar' : 'exemplares'}
//                   </span>
//                 </div>

//                 {/* Exemplares do Livro */}
//                 {expandedBooks.has(livro.id_livro) && livro.exemplares.length > 0 && (
//                   <div className="bg-white">
//                     <table className="w-full">
//                       <thead className="bg-gray-50 border-b border-gray-200">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Nº Exemplar
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Localização
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Disponibilidade
//                           </th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                             Ações
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {livro.exemplares.map((exemplar) => (
//                           <tr key={exemplar.id_exemplar} className="hover:bg-gray-50 transition-colors">
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
//                               #{exemplar.numero_exemplar}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
//                               {editingId === exemplar.id_exemplar ? (
//                                 <input
//                                   type="text"
//                                   className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   value={tempData.localizacao || ''}
//                                   onChange={(e) => setTempData({ ...tempData, localizacao: e.target.value })}
//                                 />
//                               ) : (
//                                 exemplar.localizacao
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               {editingId === exemplar.id_exemplar ? (
//                                 <select
//                                   className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                   value={tempData.disponibilidade || ''}
//                                   onChange={(e) => setTempData({ ...tempData, disponibilidade: e.target.value as any })}
//                                 >
//                                   <option value="disponivel">disponível</option>
//                                   <option value="emprestado">emprestado</option>
//                                   <option value="reservado">reservado</option>
//                                 </select>
//                               ) : (
//                                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDisponibilidadeColor(exemplar.disponibilidade)}`}>
//                                   {exemplar.disponibilidade}
//                                 </span>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm">
//                               <div className="flex gap-2">
//                                 {editingId === exemplar.id_exemplar ? (
//                                   <>
//                                     <button
//                                       onClick={() => handleSave(exemplar.id_exemplar, livro.id_livro)}
//                                       className="text-green-600 hover:text-green-800 transition-colors"
//                                       title="Salvar"
//                                     >
//                                       <Save className="w-4 h-4" />
//                                     </button>
//                                     <button
//                                       onClick={handleCancel}
//                                       className="text-gray-600 hover:text-gray-800 transition-colors"
//                                       title="Cancelar"
//                                     >
//                                       <X className="w-4 h-4" />
//                                     </button>
//                                   </>
//                                 ) : (
//                                   <>
//                                     <button
//                                       onClick={() => handleEdit(exemplar)}
//                                       className="text-blue-600 hover:text-blue-800 transition-colors"
//                                       title="Editar"
//                                     >
//                                       <Edit3 className="w-4 h-4" />
//                                     </button>
//                                     <button
//                                       onClick={() => handleDelete(exemplar.id_exemplar)}
//                                       className="text-red-600 hover:text-red-800 transition-colors"
//                                       title="Excluir"
//                                     >
//                                       <Trash2 className="w-4 h-4" />
//                                     </button>
//                                   </>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}

//                 {expandedBooks.has(livro.id_livro) && livro.exemplares.length === 0 && (
//                   <div className="px-6 py-8 text-center text-gray-500 text-sm bg-gray-50">
//                     Nenhum exemplar cadastrado para este livro
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
