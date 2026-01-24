"use client";
import { Plus } from "lucide-react";
import { useState, useMemo } from "react";
import { BookService } from "@/services/book-service";
import { LivroComExemplares } from "@/services/exemplar-service";
import { Livro } from "@/types/livros";

interface BookSelectionFormProps {
  livrosComExemplares: LivroComExemplares[];
  onAdicionar: (exemplar: any, detalhes: Livro) => void;
  podeAdicionar: boolean;
  datas: { emprestimo: string; prevista: string };
  onDatasChange: (d: { emprestimo: string; prevista: string }) => void;
  onLivroVisualizado: (d: Livro | null) => void;
}

export function BookSelectionForm({
  livrosComExemplares,
  onAdicionar,
  podeAdicionar,
  datas,
  onDatasChange,
  onLivroVisualizado,
}: BookSelectionFormProps) {
  const [livroId, setLivroId] = useState("");
  const [exemplarId, setExemplarId] = useState("");
  const [detalhes, setDetalhes] = useState<Livro | null>(null);

  const bookService = new BookService();

  const exemplaresDisp = useMemo(() => {
    if (!livroId) return [];
    const livro = livrosComExemplares.find(
      (l) => l.id_livro === parseInt(livroId),
    );
    return livro
      ? livro.exemplares.filter((ex) => ex.disponibilidade === "disponivel")
      : [];
  }, [livroId, livrosComExemplares]);

  const handleLivroChange = async (id: string) => {
    setLivroId(id);
    setExemplarId("");

    if (id) {
      try {
        const res = await bookService.getAllBooks();
        const d = res.find((b) => b.id_livro === parseInt(id)) || null;
        setDetalhes(d);
        onLivroVisualizado(d);
      } catch (error) {
        console.error("Erro ao buscar detalhes:", error);
      }
    } else {
      setDetalhes(null);
      onLivroVisualizado(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Seleção de Livro */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-600">Livro</label>
        <select
          value={livroId}
          onChange={(e) => handleLivroChange(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-denin transition-all text-sm"
        >
          <option value="">Selecione o Livro...</option>
          {livrosComExemplares.map((l) => (
            <option key={l.id_livro} value={l.id_livro}>
              {l.titulo}
            </option>
          ))}
        </select>
      </div>

      {/* Exemplar e Botão - CORRIGIDO */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 items-end">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Exemplar
          </label>
          <select
            value={exemplarId}
            onChange={(e) => setExemplarId(e.target.value)}
            disabled={!livroId}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white outline-none disabled:bg-gray-50 focus:ring-2 focus:ring-denin transition-all text-sm"
          >
            <option value="">Selecione o exemplar...</option>
            {exemplaresDisp.map((ex) => (
              <option key={ex.id_exemplar} value={ex.id_exemplar}>
                #{ex.numero_exemplar} - {ex.localizacao}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            const ex = exemplaresDisp.find(
              (e) => e.id_exemplar === parseInt(exemplarId),
            );
            if (ex && detalhes) onAdicionar(ex, detalhes);
          }}
          disabled={!podeAdicionar || !exemplarId}
          className="w-full sm:w-14 h-[46px] bg-denin text-white rounded-xl disabled:opacity-30 hover:bg-blue-800 transition-all flex items-center justify-center shrink-0 shadow-lg shadow-denin/10 active:scale-95"
          title="Adicionar à cesta"
        >
          <Plus size={24} />
          <span className="sm:hidden ml-2 font-bold text-sm">Adicionar</span>
        </button>
      </div>

      {/* Datas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Empréstimo
          </label>
          <input
            type="date"
            value={datas.emprestimo}
            readOnly
            className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase">
            Devolução
          </label>
          <input
            type="date"
            value={datas.prevista}
            onChange={(e) =>
              onDatasChange({ ...datas, prevista: e.target.value })
            }
            className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-denin bg-white"
          />
        </div>
      </div>
    </div>
  );
}
