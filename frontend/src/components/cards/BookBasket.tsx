import { BookOpen, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Livro } from '@/types/livros';

export interface BasketItem {
  id_exemplar: number;
  numero_exemplar: number;
  titulo: string;
}

interface BookBasketProps {
  itens: BasketItem[];
  onRemove: (id: number) => void;
  livroDetalhes: Livro | null;
}

export function BookBasket({
  itens,
  onRemove,
  livroDetalhes,
}: BookBasketProps) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-3xl p-6 min-h-[300px]">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag size={16} /> Cesta ({itens.length}/3)
        </h3>
        {itens.length === 0 ? (
          <p className="text-xs text-gray-400">Nenhum livro selecionado.</p>
        ) : (
          <div className="space-y-3">
            {itens.map((ex) => (
              <div
                key={ex.id_exemplar}
                className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900">{ex.titulo}</p>
                  <p className="text-[10px] text-denin font-medium">
                    Exemplar #{ex.numero_exemplar}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(ex.id_exemplar)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {livroDetalhes && (
        <div className="flex gap-4 items-center animate-in slide-in-from-left-2">
          <div className="relative w-20 h-28 flex-shrink-0">
            <Image
              src={livroDetalhes.capa || 'https://via.placeholder.com/80x112'}
              alt="capa"
              fill
              className="object-cover rounded-lg shadow-sm"
            />
          </div>
          <p className="text-xs font-medium text-gray-600 italic">
            &quot;{livroDetalhes.titulo}&quot; selecionado para adicionar.
          </p>
        </div>
      )}
    </div>
  );
}
