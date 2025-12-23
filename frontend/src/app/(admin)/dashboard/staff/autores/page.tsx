"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { AuthorService } from "@/services/author-service";
import { Autor } from "@/types/autores";
import { toast } from "sonner";
import {
  UserPlus,
  Trash2,
  Edit3,
  X,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export default function GerenciarAutores() {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Estados de Formulário e Modal de Edição
  const [novoNome, setNovoNome] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [autorParaEditar, setAutorParaEditar] = useState<Autor | null>(null);
  const [nomeEditado, setNomeEditado] = useState<string>("");

  // Estados para Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [autorParaDeletar, setAutorParaDeletar] = useState<Autor | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const service = useMemo(() => new AuthorService(), []);

  const fetchData = useCallback(
    async (isInitialLoad: boolean = false) => {
      if (isInitialLoad) setLoading(true);
      try {
        const dados = await service.getAllAuthors();
        setAutores(dados);
      } catch (err) {
        toast.error("Erro ao carregar a lista de autores.");
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    },
    [service]
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalPages = Math.ceil(autores.length / itemsPerPage);
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return autores.slice(startIndex, startIndex + itemsPerPage);
  }, [autores, currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- HANDLERS ---

  const handleCadastrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    try {
      await service.createAuthor({ nome_autor: novoNome });
      setNovoNome("");
      await fetchData();
      setCurrentPage(1);
      toast.success("Autor cadastrado com sucesso!");
    } catch (err) {
      toast.error((err as Error).message || "Erro ao cadastrar autor.");
    }
  };

  const handleSalvarEdicao = async () => {
    if (!autorParaEditar || !nomeEditado.trim()) return;
    try {
      await service.updateAuthor({
        id_autor: autorParaEditar.id_autor,
        nome_autor: nomeEditado,
      });
      setIsEditModalOpen(false);
      await fetchData();
      toast.success("Dados do autor atualizados!");
    } catch (err) {
      toast.error((err as Error).message || "Erro ao atualizar autor.");
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!autorParaDeletar) return;
    setIsDeleting(true);
    try {
      await service.deleteAuthor(autorParaDeletar.id_autor);
      setAutores((prev) =>
        prev.filter((a) => a.id_autor !== autorParaDeletar.id_autor)
      );
      setIsDeleteModalOpen(false);
      toast.warning("Autor removido do sistema.");

      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err) {
      toast.error("Erro ao excluir. O autor pode possuir livros vinculados.");
    } finally {
      setIsDeleting(false);
      setAutorParaDeletar(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Autores</h1>
        <p className="text-sm text-gray-500 font-medium">
          Cadastre, atualize e exclua autores do acervo.
        </p>
      </div>

      {/* Form Cadastro */}
      <form
        onSubmit={handleCadastrar}
        className="bg-white p-6 rounded-2xl border border-gray-200 flex gap-4 items-end shadow-sm"
      >
        <div className="grow space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Novo Autor
          </label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none transition-all"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Nome do autor..."
          />
        </div>
        <button
          type="submit"
          className="bg-denin text-white px-8 py-2.5 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center gap-2 shadow-lg shadow-denin/20"
        >
          <UserPlus size={18} /> Cadastrar
        </button>
      </form>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400">
            <tr>
              <th className="p-5 text-xs font-bold uppercase w-24">ID</th>
              <th className="p-5 text-xs font-bold uppercase">Nome</th>
              <th className="p-5 text-xs font-bold uppercase text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={3} className="p-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-denin" />
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-20 text-center text-gray-400">
                  Nenhum autor encontrado.
                </td>
              </tr>
            ) : (
              currentData.map((autor) => (
                <tr
                  key={autor.id_autor}
                  className="hover:bg-gray-50/50 group transition-colors"
                >
                  <td className="p-5 text-sm font-mono text-gray-400">
                    #{autor.id_autor}
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-800 uppercase">
                    {autor.nome_autor}
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setAutorParaEditar(autor);
                        setNomeEditado(autor.nome_autor);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2.5 text-gray-400 hover:text-denin hover:bg-denin/10 rounded-xl transition-all"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setAutorParaDeletar(autor);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-100 transition-all shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        currentPage === page
                          ? "bg-denin text-white shadow-md shadow-denin/20"
                          : "text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border bg-white disabled:opacity-30 hover:bg-gray-100 transition-all shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Edit3 size={20} className="text-denin" /> Editar Autor
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Nome do Autor
              </label>
              <input
                className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none transition-all font-medium"
                value={nomeEditado}
                onChange={(e) => setNomeEditado(e.target.value)}
                autoFocus
              />
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={handleSalvarEdicao}
                className="flex-1 bg-denin text-white py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-denin/20"
              >
                <Save size={18} /> Salvar Alterações
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3.5 text-gray-500 font-bold hover:bg-gray-200 rounded-2xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EXCLUSÃO */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Confirmar Exclusão
              </h2>
              <p className="text-sm text-gray-500">
                Tem certeza que deseja excluir{" "}
                <strong>{autorParaDeletar?.nome_autor}</strong>? Esta ação não
                pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={handleConfirmarExclusao}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                {isDeleting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  "Excluir Agora"
                )}
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 bg-white border border-gray-200 text-gray-500 py-3 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
