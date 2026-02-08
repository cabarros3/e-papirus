'use client';
import {
  RefreshCw,
  Calendar,
  Book,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';

interface ConfirmarRenovacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  dados: {
    titulo: string;
    dataAtual: string;
    novaData: string;
  } | null;
}

export function ConfirmarRenovacaoModal({
  isOpen,
  onClose,
  onConfirm,
  loading,
  dados,
}: ConfirmarRenovacaoModalProps) {
  if (!isOpen || !dados) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <RefreshCw size={32} className="text-denin" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900 leading-tight">
              Confirmar Renovação?
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              Você está estendendo o prazo de leitura em mais 7 dias.
            </p>
          </div>

          <div className="w-full bg-gray-50 rounded-[2rem] p-6 mt-4 space-y-5 text-left border border-gray-100">
            <div className="flex items-start gap-3">
              <Book size={18} className="text-gray-400 mt-1" />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Livro
                </p>
                <p className="text-sm font-bold text-gray-900 line-clamp-2">
                  {dados.titulo}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Vencimento Atual
                </p>
                <p className="text-xs font-bold text-gray-500 line-through">
                  {new Date(dados.dataAtual + 'T00:00:00').toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-denin uppercase tracking-widest">
                  Nova Data
                </p>
                <p className="text-sm font-bold text-denin flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(dados.novaData + 'T00:00:00').toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              onClick={onConfirm}
              disabled={loading}
              className="w-full bg-denin text-white py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Sim, Confirmar Renovação'
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full bg-white text-gray-500 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all border border-transparent"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
