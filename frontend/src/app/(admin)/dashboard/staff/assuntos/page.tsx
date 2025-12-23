"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { SubjectService } from "@/services/subject-service";
import { Assunto } from "@/types/assuntos";
import { toast } from "sonner";
import {
  Tag,
  Trash2,
  Edit3,
  X,
  // Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  AlertTriangle,
} from "lucide-react";

export default function GerenciarAssuntos() {
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Modais e Formulários
  const [novoNome, setNovoNome] = useState<string>("");

  // Estado para Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [assuntoParaEditar, setAssuntoParaEditar] = useState<Assunto | null>(
    null
  );
  const [nomeEditado, setNomeEditado] = useState<string>("");

  // Estado para Modal de Exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [assuntoParaDeletar, setAssuntoParaDeletar] = useState<Assunto | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const service = useMemo(() => new SubjectService(), []);

  const fetchData = useCallback(
    async (isInitialLoad: boolean = false) => {
      if (isInitialLoad) setLoading(true);
      try {
        const dados = await service.getAllSubjects();
        setAssuntos(dados);
      } catch (err) {
        toast.error("Erro ao carregar assuntos.");
      } finally {
        if (isInitialLoad) setLoading(false);
      }
    },
    [service]
  );

  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  // Paginação
  const totalPages = Math.ceil(assuntos.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return assuntos.slice(start, start + itemsPerPage);
  }, [assuntos, currentPage]);

  // Handlers
  const handleCadastrar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!novoNome.trim()) return;
    try {
      await service.createSubject({ nome_assunto: novoNome });
      setNovoNome("");
      await fetchData();
      toast.success("Assunto criado com sucesso!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleSalvarEdicao = async () => {
    if (!assuntoParaEditar || !nomeEditado.trim()) return;
    try {
      await service.updateSubject({
        id_assunto: assuntoParaEditar.id_assunto,
        nome_assunto: nomeEditado,
      });
      setIsEditModalOpen(false);
      await fetchData();
      toast.success("Assunto atualizado!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!assuntoParaDeletar) return;
    setIsDeleting(true);
    try {
      await service.deleteSubject(assuntoParaDeletar.id_assunto);
      setAssuntos((prev) =>
        prev.filter((a) => a.id_assunto !== assuntoParaDeletar.id_assunto)
      );
      setIsDeleteModalOpen(false);
      toast.warning("Assunto removido com sucesso.");
      if (currentData.length === 1 && currentPage > 1)
        setCurrentPage(currentPage - 1);
    } catch (err) {
      toast.error("Erro ao excluir. O assunto pode estar em uso.");
    } finally {
      setIsDeleting(false);
      setAssuntoParaDeletar(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Assuntos</h1>
        <p className="text-sm text-gray-500 font-medium">
          Categorização do acervo.
        </p>
      </div>

      {/* Form Cadastro */}
      <form
        onSubmit={handleCadastrar}
        className="bg-white p-6 rounded-2xl border border-gray-200 flex gap-4 items-end shadow-sm"
      >
        <div className="grow space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Novo Assunto
          </label>
          <input
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-denin outline-none"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            placeholder="Ex: Tecnologia, Romance..."
          />
        </div>
        <button
          type="submit"
          className="bg-denin text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-800 transition-all"
        >
          <Plus size={18} /> Adicionar
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
            ) : (
              currentData.map((item) => (
                <tr
                  key={item.id_assunto}
                  className="hover:bg-gray-50/50 group transition-colors"
                >
                  <td className="p-5 text-sm font-mono text-gray-400">
                    #{item.id_assunto}
                  </td>
                  <td className="p-5 text-sm font-semibold text-gray-800 uppercase">
                    {item.nome_assunto}
                  </td>
                  <td className="p-5 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setAssuntoParaEditar(item);
                        setNomeEditado(item.nome_assunto);
                        setIsEditModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-denin hover:bg-denin/10 rounded-lg"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setAssuntoParaDeletar(item);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
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
          <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded border bg-white disabled:opacity-30"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded border bg-white disabled:opacity-30"
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
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Tag size={20} className="text-denin" /> Editar Categoria
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <label className="text-xs font-bold text-gray-400 uppercase">
                Nome do Assunto
              </label>
              <input
                className="w-full px-4 py-3 rounded-2xl border focus:ring-2 focus:ring-denin outline-none"
                value={nomeEditado}
                onChange={(e) => setNomeEditado(e.target.value)}
              />
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={handleSalvarEdicao}
                className="flex-1 bg-denin text-white py-3 rounded-2xl font-bold"
              >
                Salvar
              </button>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 text-gray-500 font-bold"
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
                <strong>{assuntoParaDeletar?.nome_assunto}</strong>?<br />
                Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button
                onClick={handleConfirmarExclusao}
                disabled={isDeleting}
                className="flex-1 bg-red-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
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
